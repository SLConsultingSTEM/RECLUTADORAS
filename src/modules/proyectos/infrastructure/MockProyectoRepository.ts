import type { Proyecto, ProyectoRepository } from '@modules/proyectos/domain/types'
import { MOCK_PROYECTOS } from '@modules/proyectos/infrastructure/mockData'
import { mockLatency } from '@shared/api/mockLatency'

const STORAGE_KEY = 'reclutadoras.mock.proyectos.v3'

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
    await mockLatency()
    return readStore()
  }

  async getById(id: string): Promise<Proyecto | null> {
    await mockLatency(120)
    return readStore().find((item) => item.id === id) ?? null
  }

  async save(proyecto: Proyecto): Promise<Proyecto> {
    await mockLatency(120)
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
    await mockLatency(120)
    writeStore(readStore().filter((item) => item.id !== id))
  }
}
