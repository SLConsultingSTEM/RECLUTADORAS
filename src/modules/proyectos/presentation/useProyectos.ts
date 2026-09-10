import { useEffect, useRef, useState } from 'react'
import { listProyectosUseCase } from '@modules/proyectos/application/proyectoUseCases'
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

  return {
    proyectos,
    selected,
    selectedId,
    setSelectedId,
    loading,
    error,
  }
}
