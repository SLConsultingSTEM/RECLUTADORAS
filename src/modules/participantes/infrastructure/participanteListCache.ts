import type { Participante, ParticipanteRepository } from '@modules/participantes/domain/types'

const inflight = new Map<string, Promise<Participante[]>>()
const cache = new Map<string, { data: Participante[]; at: number }>()

/** Short TTL to coalesce resumen + list fetches on the same panel mount. */
const TTL_MS = 5_000

function cacheKey(proyectoId: string) {
  return proyectoId
}

export function invalidateParticipanteListCache(proyectoId?: string) {
  if (!proyectoId) {
    cache.clear()
    return
  }
  cache.delete(cacheKey(proyectoId))
}

export async function listParticipantesCached(
  repository: ParticipanteRepository,
  proyectoId: string,
  options: { force?: boolean } = {},
): Promise<Participante[]> {
  const key = cacheKey(proyectoId)

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
    .list({ proyectoId })
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
