import type {
  ParticipanteRepository,
  RegistrarParticipanteInput,
  SeguimientoResumen,
} from '@modules/participantes/domain/types'
import { computeSeguimientoResumen } from '@modules/participantes/application/seguimientoResumen'
import { listParticipantesCached } from '@modules/participantes/infrastructure/participanteListCache'

export function listParticipantesUseCase(
  repository: ParticipanteRepository,
  filters?: { proyectoId?: string; estado?: string },
) {
  return repository.list(filters)
}

export function registerParticipanteUseCase(
  repository: ParticipanteRepository,
  input: RegistrarParticipanteInput,
) {
  return repository.register(input)
}

export async function getSeguimientoResumenUseCase(
  repository: ParticipanteRepository,
  proyectoId?: string,
): Promise<SeguimientoResumen> {
  const items = proyectoId
    ? await listParticipantesCached(repository, proyectoId)
    : await repository.list()

  return computeSeguimientoResumen(items)
}
