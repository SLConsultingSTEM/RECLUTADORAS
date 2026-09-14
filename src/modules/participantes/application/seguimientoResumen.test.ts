import { describe, expect, it } from 'vitest'
import { computeSeguimientoResumen } from '@modules/participantes/application/seguimientoResumen'
import type { Participante } from '@modules/participantes/domain/types'

function stub(estado: Participante['estado'], id: string): Participante {
  return {
    id,
    proyectoId: 'p1',
    nombre: id,
    tipoDocumento: 'CC',
    documento: id,
    genero: 'F',
    ciudad: 'Bogotá',
    telefono: '300',
    estado,
    camposExtra: {},
    observaciones: '',
    creadoPor: 'test',
    creadoEn: new Date().toISOString(),
  }
}

describe('computeSeguimientoResumen', () => {
  it('counts estados in a single pass', () => {
    const resumen = computeSeguimientoResumen([
      stub('EN_FILTRO', '1'),
      stub('EN_FILTRO', '2'),
      stub('APROBADO', '3'),
      stub('RECHAZADO', '4'),
      stub('NO_CONTESTA', '5'),
      stub('P_PACIENTE_FALLECIDO', '6'),
    ])

    expect(resumen).toEqual({
      total: 6,
      enFiltro: 2,
      aprobados: 1,
      rechazados: 1,
      noContesta: 1,
      pacienteFallecido: 1,
    })
  })
})
