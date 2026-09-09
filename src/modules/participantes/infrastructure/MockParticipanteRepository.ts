import type {
  Participante,
  ParticipanteRepository,
  RegistrarParticipanteInput,
} from '@modules/participantes/domain/types'

const STORAGE_KEY = 'reclutadoras.mock.participantes'

const SEED: Participante[] = [
  {
    id: 'p1',
    proyectoId: 'form1',
    nombre: 'Ana Pérez',
    documento: '1020304050',
    ciudad: 'Bogota',
    telefono: '3001234567',
    estado: 'EN_FILTRO',
    camposExtra: { nombre_bebe: 'Mateo' },
    creadoPor: 'reclutadora',
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'p2',
    proyectoId: 'form2',
    nombre: 'Carlos Ruiz',
    documento: '1122334455',
    ciudad: 'Barranquilla',
    telefono: '3109876543',
    estado: 'NO_CONTESTA',
    camposExtra: { producto_actual: 'Analgésico X' },
    creadoPor: 'reclutadora',
    creadoEn: new Date().toISOString(),
  },
]

function readStore(): Participante[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
    return structuredClone(SEED)
  }

  try {
    return JSON.parse(raw) as Participante[]
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
    return structuredClone(SEED)
  }
}

function writeStore(items: Participante[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export class MockParticipanteRepository implements ParticipanteRepository {
  async list(filters?: { proyectoId?: string; estado?: string }): Promise<Participante[]> {
    return readStore().filter((item) => {
      if (filters?.proyectoId && item.proyectoId !== filters.proyectoId) return false
      if (filters?.estado && item.estado !== filters.estado) return false
      return true
    })
  }

  async register(input: RegistrarParticipanteInput): Promise<Participante> {
    const created: Participante = {
      id: `p-${crypto.randomUUID()}`,
      proyectoId: input.proyectoId,
      nombre: input.nombre,
      documento: input.documento,
      ciudad: input.ciudad,
      telefono: input.telefono,
      estado: 'EN_FILTRO',
      camposExtra: input.camposExtra,
      creadoPor: input.creadoPor,
      creadoEn: new Date().toISOString(),
    }

    const list = readStore()
    list.unshift(created)
    writeStore(list)
    return created
  }
}
