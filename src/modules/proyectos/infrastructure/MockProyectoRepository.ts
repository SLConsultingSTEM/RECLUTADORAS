import type { Proyecto, ProyectoRepository } from '@modules/proyectos/domain/types'
import { MOCK_PROYECTOS } from '@modules/proyectos/infrastructure/mockData'

const STORAGE_KEY = 'reclutadoras.mock.proyectos.v2'

function readStore(): Proyecto[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROYECTOS))
    return structuredClone(MOCK_PROYECTOS)
  }

  try {
    return JSON.parse(raw) as Proyecto[]
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROYECTOS))
    return structuredClone(MOCK_PROYECTOS)
  }
}

function writeStore(proyectos: Proyecto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proyectos))
}

export class MockProyectoRepository implements ProyectoRepository {
  async list(): Promise<Proyecto[]> {
    return readStore()
  }

  async getById(id: string): Promise<Proyecto | null> {
    return readStore().find((item) => item.id === id) ?? null
  }

  async save(proyecto: Proyecto): Promise<Proyecto> {
    const list = readStore()
    const index = list.findIndex((item) => item.id === proyecto.id)

    if (index >= 0) {
      list[index] = proyecto
    } else {
      list.push(proyecto)
    }

    writeStore(list)
    return proyecto
  }

  async remove(id: string): Promise<void> {
    writeStore(readStore().filter((item) => item.id !== id))
  }
}
