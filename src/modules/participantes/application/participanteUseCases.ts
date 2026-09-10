import type {
  ParticipanteRepository,
  RegistrarParticipanteInput,
  SeguimientoResumen,
} from '@modules/participantes/domain/types'

export function listParticipantesUseCase(
  repository: ParticipanteRepository,
  filters?: { proyectoId?: string; estado?: string },
) {
  return repository.list(filters)
}

export function registerParticipanteUseCase(
  repository: ParticipanteRepository,
  input: RegistrarParticipanteInput,
) {
  return repository.register(input)
}

export async function getSeguimientoResumenUseCase(
  repository: ParticipanteRepository,
  proyectoId?: string,
): Promise<SeguimientoResumen> {
  const items = await repository.list(proyectoId ? { proyectoId } : undefined)

  return {
    total: items.length,
    enFiltro: items.filter((item) => item.estado === 'EN_FILTRO').length,
    aprobados: items.filter((item) => item.estado === 'APROBADO').length,
    rechazados: items.filter((item) => item.estado === 'RECHAZADO').length,
    noContesta: items.filter((item) => item.estado === 'NO_CONTESTA').length,
    pacienteFallecido: items.filter((item) => item.estado === 'P_PACIENTE_FALLECIDO').length,
  }
}
