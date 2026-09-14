import type { Proyecto, ProyectoRepository } from '@modules/proyectos/domain/types'
import { httpClient } from '@shared/api/HttpClient'
import { readSession } from '@shared/security/sessionStorage'

function token() {
  return readSession()?.token ?? null
}

function proyectoPath(id: string) {
  return `/api/v1/proyectos/${encodeURIComponent(id)}`
}

export class ApiProyectoRepository implements ProyectoRepository {
  async list(): Promise<Proyecto[]> {
    return httpClient.request<Proyecto[]>('/api/v1/proyectos', {
      authToken: token(),
    })
  }

  async getById(id: string): Promise<Proyecto | null> {
    return httpClient.request<Proyecto | null>(proyectoPath(id), {
      authToken: token(),
    })
  }

  async save(proyecto: Proyecto): Promise<Proyecto> {
    const method = proyecto.id ? 'PUT' : 'POST'
    const path = proyecto.id ? proyectoPath(proyecto.id) : '/api/v1/proyectos'

    return httpClient.request<Proyecto>(path, {
      method,
      body: proyecto,
      authToken: token(),
    })
  }

  async remove(id: string): Promise<void> {
    await httpClient.request<void>(proyectoPath(id), {
      method: 'DELETE',
      authToken: token(),
    })
  }
}
