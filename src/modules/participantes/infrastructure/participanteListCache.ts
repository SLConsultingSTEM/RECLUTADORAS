import type { Participante, ParticipanteRepository } from '@modules/participantes/domain/types'

const inflight = new Map<string, Promise<Participante[]>>()
const cache = new Map<string, { data: Participante[]; at: number }>()

/** Short TTL to coalesce resumen + list fetches on the same panel mount. */
const TTL_MS = 5_000

function cacheKey(proyectoId: string, reclutadora = '') {
  return `${proyectoId}|${reclutadora}`
}

export function invalidateParticipanteListCache(proyectoId?: string, reclutadora?: string) {
  // Sin proyecto, o cambiando de reclutadora, se limpia todo: las entradas de
  // otros filtros ya no son válidas para lo que se va a mostrar.
  if (!proyectoId) {
    cache.clear()
    return
  }
  cache.delete(cacheKey(proyectoId, reclutadora))
}

export async function listParticipantesCached(
  repository: ParticipanteRepository,
  proyectoId: string,
  options: { force?: boolean; reclutadora?: string } = {},
): Promise<Participante[]> {
  const key = cacheKey(proyectoId, options.reclutadora)

  if (options.force) {
    cache.delete(key)
  } else {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < TTL_MS) {
      return hit.data
    }
  }

  // Always coalesce concurrent callers (including forced refreshes).
  const pending = inflight.get(key)
  if (pending) return pending

  const request = repository
    .list({ proyectoId, reclutadora: options.reclutadora })
    .then((data) => {
      cache.set(key, { data, at: Date.now() })
      return data
    })
    .finally(() => {
      inflight.delete(key)
    })

  inflight.set(key, request)
  return request
}
