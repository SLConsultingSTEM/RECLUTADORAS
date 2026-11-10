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
  /** Valor libre según opciones configuradas en el formulario del proyecto. */
  tipoDocumento: string
  documento: string
  /** Valor libre según opciones configuradas en el formulario del proyecto. */
  genero: string
  ciudad: string
  telefono: string
  estado: EstadoParticipante
  camposExtra: Record<string, string>
  observaciones: string
  creadoPor: string
  creadoEn: string
  /** Reclutadora dueña del origen (RECLUTADORA > …). La publica la API. */
  reclutadora?: string
  /** Historial de conclusiones, de la más reciente a la más antigua. */
  conclusiones?: ConclusionParticipante[]
  /**
   * Falso cuando la persona quedó guardada pero no se inscribió al proyecto
   * (hoy, por Lista Clinton). Solo lo manda la respuesta del registro.
   */
  inscrito?: boolean
  /** Explicación para la reclutadora cuando `inscrito` es falso. */
  motivo?: string
}

/** Conclusión registrada sobre la inscripción (quién, cuándo y por qué). */
export interface ConclusionParticipante {
  fecha: string
  tipologia: string
  motivo: string
  observacion: string
  autor: string
}

export interface RegistrarParticipanteInput {
  proyectoId: string
  nombre: string
  tipoDocumento: string
  documento: string
  genero: string
  ciudad: string
  /** En texto; pueden traer el parentesco: "3001234567 (MAMÁ)". */
  telefonos: string[]
  camposExtra: Record<string, string>
  observaciones?: string
  creadoPor: string
  /**
   * La reclutadora confirmó que la persona autorizó el tratamiento de sus
   * datos (Ley 1581 de 2012). La API lo guarda en la persona, no en la
   * inscripción, y solo la primera vez.
   */
  autorizacionDatos?: boolean
  /** Versión del texto que se le leyó, para saber a qué autorizó. */
  autorizacionVersion?: string
}

export interface SeguimientoResumen {
  total: number
  enFiltro: number
  aprobados: number
  rechazados: number
  noContesta: number
  pacienteFallecido: number
}

export interface ParticipanteFiltros {
  proyectoId?: string
  estado?: string
  /** Solo la coordinadora puede filtrar por otra reclutadora. */
  reclutadora?: string
}

export interface ParticipanteRepository {
  list(filters?: ParticipanteFiltros): Promise<Participante[]>
  register(input: RegistrarParticipanteInput): Promise<Participante>
}
