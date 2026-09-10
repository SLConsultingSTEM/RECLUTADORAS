export type EstadoParticipante =
  | 'EN_FILTRO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'NO_CONTESTA'
  | 'P_PACIENTE_FALLECIDO'

export type TipoDocumento = 'CC' | 'CE'

export type GeneroParticipante = 'Masculino' | 'Femenino'

export const TIPOS_DOCUMENTO: ReadonlyArray<{ value: TipoDocumento; label: string }> = [
  { value: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { value: 'CE', label: 'Extranjero (CE)' },
]

export const GENEROS_PARTICIPANTE: ReadonlyArray<{
  value: GeneroParticipante
  label: string
}> = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
]

export interface Participante {
  id: string
  proyectoId: string
  nombre: string
  tipoDocumento: TipoDocumento | ''
  documento: string
  genero: GeneroParticipante | ''
  ciudad: string
  telefono: string
  estado: EstadoParticipante
  camposExtra: Record<string, string>
  observaciones: string
  creadoPor: string
  creadoEn: string
}

export interface RegistrarParticipanteInput {
  proyectoId: string
  nombre: string
  tipoDocumento: TipoDocumento | ''
  documento: string
  genero: GeneroParticipante | ''
  ciudad: string
  telefono: string
  camposExtra: Record<string, string>
  observaciones?: string
  creadoPor: string
}

export interface SeguimientoResumen {
  total: number
  enFiltro: number
  aprobados: number
  rechazados: number
  noContesta: number
  pacienteFallecido: number
}

export interface ParticipanteRepository {
  list(filters?: { proyectoId?: string; estado?: string }): Promise<Participante[]>
  register(input: RegistrarParticipanteInput): Promise<Participante>
}
