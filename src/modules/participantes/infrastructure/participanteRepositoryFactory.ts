import { env } from '@shared/config/env'
import type { ParticipanteRepository } from '@modules/participantes/domain/types'
import { ApiParticipanteRepository } from '@modules/participantes/infrastructure/ApiParticipanteRepository'
import { MockParticipanteRepository } from '@modules/participantes/infrastructure/MockParticipanteRepository'

export function createParticipanteRepository(): ParticipanteRepository {
  return env.useMock
    ? new MockParticipanteRepository()
    : new ApiParticipanteRepository()
}
