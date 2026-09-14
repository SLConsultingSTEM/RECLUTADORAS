import { useEffect, useState } from 'react'
import { computeSeguimientoResumen } from '@modules/participantes/application/seguimientoResumen'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import {
  invalidateParticipanteListCache,
  listParticipantesCached,
} from '@modules/participantes/infrastructure/participanteListCache'
import type { SeguimientoResumen } from '@modules/participantes/domain/types'

const participanteRepository = createParticipanteRepository()

const EMPTY_RESUMEN: SeguimientoResumen = {
  total: 0,
  enFiltro: 0,
  aprobados: 0,
  rechazados: 0,
  noContesta: 0,
  pacienteFallecido: 0,
}

export function useSeguimientoResumen(proyectoId: string, refreshKey = 0) {
  const [resumen, setResumen] = useState<SeguimientoResumen>(EMPTY_RESUMEN)
  const [loading, setLoading] = useState(Boolean(proyectoId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!proyectoId) {
      setResumen(EMPTY_RESUMEN)
      setLoading(false)
      setError('')
      return
    }

    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const force = refreshKey > 0
        if (force) invalidateParticipanteListCache(proyectoId)
        const items = await listParticipantesCached(participanteRepository, proyectoId, {
          force,
        })
        if (active) setResumen(computeSeguimientoResumen(items))
      } catch (err) {
        if (active) {
          setResumen(EMPTY_RESUMEN)
          setError(err instanceof Error ? err.message : 'No se pudo cargar el resumen')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [proyectoId, refreshKey])

  return { resumen, loading, error }
}
