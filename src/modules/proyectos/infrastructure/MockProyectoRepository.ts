import type { Proyecto, ProyectoRepository } from '@modules/proyectos/domain/types'
import { MOCK_PROYECTOS } from '@modules/proyectos/infrastructure/mockData'
import { mockLatency } from '@shared/api/mockLatency'

const STORAGE_KEY = 'reclutadoras.mock.proyectos.v4'
const LEGACY_RASTER_EXT = /\.(png|jpe?g|gif)$/i

/** Maps persisted mock paths after PNG/JPEG assets were replaced by WebP. */
function migrateMockMedia(proyecto: Proyecto): Proyecto {
  if (!proyecto.imagenUrl.startsWith('/proyectos/')) return proyecto
  if (!LEGACY_RASTER_EXT.test(proyecto.imagenUrl)) return proyecto

  return {
    ...proyecto,
    imagenUrl: proyecto.imagenUrl.replace(LEGACY_RASTER_EXT, '.webp'),
    imagenNombre: LEGACY_RASTER_EXT.test(proyecto.imagenNombre)
      ? proyecto.imagenNombre.replace(LEGACY_RASTER_EXT, '.webp')
      : proyecto.imagenNombre,
  }
}

function readStore(): Proyecto[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROYECTOS))
    return structuredClone(MOCK_PROYECTOS)
  }

  try {
    const parsed = JSON.parse(raw) as Proyecto[]
    const migrated = parsed.map(migrateMockMedia)
    const changed = migrated.some(
      (item, index) =>
        item.imagenUrl !== parsed[index]?.imagenUrl ||
        item.imagenNombre !== parsed[index]?.imagenNombre,
    )
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return migrated
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
