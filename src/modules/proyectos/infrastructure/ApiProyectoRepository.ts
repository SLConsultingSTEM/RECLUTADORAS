import type {
  PiezaSubida,
  Proyecto,
  ProyectoRepository,
} from '@modules/proyectos/domain/types'
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
    // Los proyectos son los estudios abiertos de Optima: desde el portal solo
    // se edita lo suyo (indicaciones, pieza, formulario), nunca se crean.
    if (!proyecto.id) {
      throw new Error('Los proyectos se crean en Optima, no desde el portal')
    }

    return httpClient.request<Proyecto>(proyectoPath(proyecto.id), {
      method: 'PUT',
      body: proyecto,
      authToken: token(),
    })
  }

  async remove(): Promise<void> {
    throw new Error('Los proyectos se cierran en Optima, no desde el portal')
  }

  /** Sube la pieza gráfica; la API la envía a Cloudinary y devuelve su URL. */
  async uploadPieza(id: string, file: File): Promise<PiezaSubida> {
    const form = new FormData()
    form.append('file', file)

    return httpClient.request<PiezaSubida>(`${proyectoPath(id)}/pieza`, {
      method: 'POST',
      body: form,
      authToken: token(),
    })
  }
}
