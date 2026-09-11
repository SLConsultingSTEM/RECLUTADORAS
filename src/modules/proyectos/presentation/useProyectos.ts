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
  ) {
    if (!selected) throw new Error('No hay proyecto seleccionado')
    const saved = await saveProyectoUseCase(proyectoRepository, {
      ...selected,
      ...patch,
    })
    setProyectos((prev) => prev.map((item) => (item.id === saved.id ? saved : item)))
    return saved
  }

  async function createProyecto(input: {
    nombre: string
    ciudadesPermitidas: string[]
    duplicarDesdeId?: string
  }) {
    const source = input.duplicarDesdeId
      ? proyectos.find((item) => item.id === input.duplicarDesdeId) ?? null
      : null

    if (input.duplicarDesdeId && !source) {
      throw new Error('No se encontró el proyecto a duplicar')
    }

    const proyecto: Proyecto = {
      id: `form-${crypto.randomUUID().slice(0, 8)}`,
      nombre: input.nombre.trim(),
      descripcionHtml: source?.descripcionHtml ?? '',
      imagenUrl: source?.imagenUrl ?? '',
      imagenNombre: source?.imagenNombre ?? '',
      ciudadesPermitidas:
        input.ciudadesPermitidas.length > 0
          ? input.ciudadesPermitidas
          : source?.ciudadesPermitidas?.length
            ? [...source.ciudadesPermitidas]
            : ['Bogotá'],
      camposBase: source?.camposBase
        ? structuredClone(source.camposBase)
        : undefined,
      titulosFormulario: source?.titulosFormulario
        ? structuredClone(source.titulosFormulario)
        : undefined,
      camposEspecificos: source
        ? structuredClone(source.camposEspecificos)
        : [],
      activo: true,
    }
    const saved = await saveProyectoUseCase(proyectoRepository, proyecto)
    setProyectos((prev) => [...prev, saved])
    setSelectedId(saved.id)
    setError('')
    return saved
  }

  return {
    proyectos,
    selected,
    selectedId,
    setSelectedId,
    loading,
    error,
    updateSelected,
    createProyecto,
  }
}
