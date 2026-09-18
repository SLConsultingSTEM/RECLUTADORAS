import type {
  Participante,
  ParticipanteFiltros,
  ParticipanteRepository,
  RegistrarParticipanteInput,
} from '@modules/participantes/domain/types'
import { httpClient } from '@shared/api/HttpClient'
import { readSession } from '@shared/security/sessionStorage'

function token() {
  return readSession()?.token ?? null
}

export class ApiParticipanteRepository implements ParticipanteRepository {
  /** Opciones del filtro de la coordinadora. */
  async listReclutadoras(): Promise<string[]> {
    return httpClient.request<string[]>('/api/v1/reclutadoras', { authToken: token() })
  }

  async list(filters?: ParticipanteFiltros): Promise<Participante[]> {
    const params = new URLSearchParams()
    if (filters?.proyectoId) params.set('proyectoId', filters.proyectoId)
    if (filters?.estado) params.set('estado', filters.estado)
    if (filters?.reclutadora) params.set('reclutadora', filters.reclutadora)
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
