import { useEffect, useRef, useState } from 'react'
import {
  listProyectosUseCase,
  saveProyectoUseCase,
} from '@modules/proyectos/application/proyectoUseCases'
import { createProyectoRepository } from '@modules/proyectos/infrastructure/proyectoRepositoryFactory'
import type { Proyecto } from '@modules/proyectos/domain/types'

const proyectoRepository = createProyectoRepository()

export function useProyectos(preferredId?: string) {
  const preferredIdRef = useRef(preferredId)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const data = await listProyectosUseCase(proyectoRepository)
        const activos = data.filter((item) => item.activo)
        if (!active) return
        setProyectos(activos)
        const preferred = preferredIdRef.current
        setSelectedId((prev) => {
          if (prev && activos.some((item) => item.id === prev)) return prev
          if (preferred && activos.some((item) => item.id === preferred)) {
            return preferred
          }
          return activos[0]?.id || ''
        })
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar proyectos')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const selected = proyectos.find((item) => item.id === selectedId) ?? null

  async function updateSelected(
    patch: Partial<
      Pick<
        Proyecto,
        | 'descripcionHtml'
        | 'imagenUrl'
        | 'imagenNombre'
        | 'camposEspecificos'
        | 'camposBase'
        | 'titulosFormulario'
      >
    >,
    options: { refrescarEstado?: boolean } = {},
  ) {
    if (!selected) throw new Error('No hay proyecto seleccionado')
    const saved = await saveProyectoUseCase(proyectoRepository, {
      ...selected,
      ...patch,
    })

    // El autosave guarda mientras se edita. Reemplazar el proyecto en ese
    // momento reinicializa el formulario completo y el navegador pierde la
    // posición del scroll, así que solo se refresca cuando lo pide quien llama.
    if (options.refrescarEstado ?? true) {
      setProyectos((prev) => prev.map((item) => (item.id === saved.id ? saved : item)))
    }

    return saved
  }

  /**
   * Sube la pieza gráfica del proyecto seleccionado. La imagen se guarda en
   * Cloudinary a través de la API; aquí solo circula la URL.
   */
  async function uploadPieza(file: File) {
    if (!selected) throw new Error('No hay proyecto seleccionado')
    if (!proyectoRepository.uploadPieza) {
      throw new Error('La subida de imágenes no está disponible')
    }

    const subida = await proyectoRepository.uploadPieza(selected.id, file)

    // La API ya guardó la URL. Hay que reflejarla en memoria de inmediato: si
    // el proyecto se queda con la imagen anterior, el siguiente guardado la
    // reenvía y borra la recién subida.
    setProyectos((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? { ...item, imagenUrl: subida.imagenUrl, imagenNombre: subida.imagenNombre }
          : item,
      ),
    )

    return subida
  }

  return {
    proyectos,
    selected,
    selectedId,
    setSelectedId,
    loading,
    error,
    updateSelected,
    uploadPieza,
  }
}
