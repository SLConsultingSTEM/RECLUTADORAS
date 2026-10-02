import { describe, expect, it } from 'vitest'
import { datosEnMayusculas } from '@modules/participantes/application/participanteUseCases'

describe('datosEnMayusculas', () => {
  const input = {
    proyectoId: 'abc-1',
    nombre: ' maría peña ',
    tipoDocumento: 'cc',
    documento: '123',
    genero: 'Femenino',
    ciudad: 'Bogotá',
    telefono: '300',
    camposExtra: { marca: 'nivea', 'participante.email': 'Ana@Correo.com' },
    creadoPor: 'coordinadora',
  }

  it('pasa a mayúsculas los datos y deja los correos como se escribieron', () => {
    const out = datosEnMayusculas(input, new Set(['participante.email']))
    expect(out.nombre).toBe('MARÍA PEÑA')
    expect(out.ciudad).toBe('BOGOTÁ')
    expect(out.camposExtra).toEqual({ marca: 'NIVEA', 'participante.email': 'Ana@Correo.com' })
    expect(out.proyectoId).toBe('abc-1')
    expect(out.creadoPor).toBe('coordinadora')
  })
})
