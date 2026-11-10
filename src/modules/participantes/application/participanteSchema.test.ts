import { describe, expect, it } from 'vitest'
import { buildParticipanteSchema } from './participanteSchema'

const datosMinimos = {
  nombre: 'ANA MORENO',
  genero: 'Femenino',
  tipoDocumento: 'CC',
  documento: '1057545207',
  ciudad: 'BOGOTA',
  telefonos: ['3115367577'],
  camposExtra: {},
}

describe('autorización de tratamiento de datos (Ley 1581)', () => {
  const schema = buildParticipanteSchema([])

  it('no deja registrar sin la autorización', () => {
    const sinMarcar = schema.safeParse({ ...datosMinimos, autorizacionDatos: false })
    expect(sinMarcar.success).toBe(false)
    expect(
      sinMarcar.error?.issues.some((issue) => issue.path[0] === 'autorizacionDatos'),
    ).toBe(true)
  })

  it('trata la autorización ausente como no dada', () => {
    expect(schema.safeParse(datosMinimos).success).toBe(false)
  })

  it('deja registrar cuando está marcada', () => {
    expect(
      schema.safeParse({ ...datosMinimos, autorizacionDatos: true }).success,
    ).toBe(true)
  })
})
