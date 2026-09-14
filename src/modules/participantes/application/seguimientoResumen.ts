import type { Participante, SeguimientoResumen } from '@modules/participantes/domain/types'

export function computeSeguimientoResumen(items: Participante[]): SeguimientoResumen {
  let enFiltro = 0
  let aprobados = 0
  let rechazados = 0
  let noContesta = 0
  let pacienteFallecido = 0

  for (const item of items) {
    switch (item.estado) {
      case 'EN_FILTRO':
        enFiltro += 1
        break
      case 'APROBADO':
        aprobados += 1
        break
      case 'RECHAZADO':
        rechazados += 1
        break
      case 'NO_CONTESTA':
        noContesta += 1
        break
      case 'P_PACIENTE_FALLECIDO':
        pacienteFallecido += 1
        break
      default:
        break
    }
  }

  return {
    total: items.length,
    enFiltro,
    aprobados,
    rechazados,
    noContesta,
    pacienteFallecido,
  }
}
