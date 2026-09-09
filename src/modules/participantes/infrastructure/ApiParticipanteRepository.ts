import type {
  Participante,
  ParticipanteRepository,
  RegistrarParticipanteInput,
} from '@modules/participantes/domain/types'
import { httpClient } from '@shared/api/HttpClient'
import { readSession } from '@shared/security/sessionStorage'

function token() {
  return readSession()?.token ?? null
}

export class ApiParticipanteRepository implements ParticipanteRepository {
  async list(filters?: { proyectoId?: string; estado?: string }): Promise<Participante[]> {
    const params = new URLSearchParams()
    if (filters?.proyectoId) params.set('proyectoId', filters.proyectoId)
    if (filters?.estado) params.set('estado', filters.estado)
    const query = params.toString()

    return httpClient.request<Participante[]>(
      `/api/v1/participantes${query ? `?${query}` : ''}`,
      { authToken: token() },
    )
  }

  async register(input: RegistrarParticipanteInput): Promise<Participante> {
    return httpClient.request<Participante>('/api/v1/participantes', {
      method: 'POST',
      body: input,
      authToken: token(),
    })
  }
}
