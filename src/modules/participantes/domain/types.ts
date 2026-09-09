export type EstadoParticipante =
  | 'EN_FILTRO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'NO_CONTESTA'
  | 'P_PACIENTE_FALLECIDO'

export interface Participante {
  id: string
  proyectoId: string
  nombre: string
  documento: string
  ciudad: string
  telefono: string
  estado: EstadoParticipante
  camposExtra: Record<string, string>
  creadoPor: string
  creadoEn: string
}

export interface RegistrarParticipanteInput {
  proyectoId: string
  nombre: string
  documento: string
  ciudad: string
  telefono: string
  camposExtra: Record<string, string>
  creadoPor: string
}

export interface ParticipanteRepository {
  list(filters?: { proyectoId?: string; estado?: string }): Promise<Participante[]>
  register(input: RegistrarParticipanteInput): Promise<Participante>
}
