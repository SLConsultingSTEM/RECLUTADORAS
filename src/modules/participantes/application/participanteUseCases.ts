import type {
  ParticipanteRepository,
  RegistrarParticipanteInput,
} from '@modules/participantes/domain/types'

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
