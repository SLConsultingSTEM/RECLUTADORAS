import type { Proyecto, ProyectoRepository } from '@modules/proyectos/domain/types'
import { httpClient } from '@shared/api/HttpClient'
import { readSession } from '@shared/security/sessionStorage'

function token() {
  return readSession()?.token ?? null
}

export class ApiProyectoRepository implements ProyectoRepository {
  async list(): Promise<Proyecto[]> {
    return httpClient.request<Proyecto[]>('/api/v1/proyectos', {
      authToken: token(),
    })
  }

  async getById(id: string): Promise<Proyecto | null> {
    return httpClient.request<Proyecto | null>(`/api/v1/proyectos/${id}`, {
      authToken: token(),
    })
  }

  async save(proyecto: Proyecto): Promise<Proyecto> {
    const method = proyecto.id ? 'PUT' : 'POST'
    const path = proyecto.id
      ? `/api/v1/proyectos/${proyecto.id}`
      : '/api/v1/proyectos'

    return httpClient.request<Proyecto>(path, {
      method,
      body: proyecto,
      authToken: token(),
    })
  }

  async remove(id: string): Promise<void> {
    await httpClient.request<void>(`/api/v1/proyectos/${id}`, {
      method: 'DELETE',
      authToken: token(),
    })
  }
}
