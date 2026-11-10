import { describe, expect, it } from 'vitest'
import { datosEnMayusculas } from '@modules/participantes/application/participanteUseCases'
import { VERSION_AUTORIZACION_DATOS } from '@modules/participantes/domain/autorizacionDatos'

describe('datosEnMayusculas', () => {
  const input = {
    proyectoId: 'abc-1',
    nombre: ' maría peña ',
    tipoDocumento: 'cc',
    documento: '123',
    genero: 'Femenino',
    ciudad: 'Bogotá',
    telefonos: ['300 123 4567 (mamá)'],
    camposExtra: { marca: 'nivea', 'participante.email': 'Ana@Correo.com' },
    creadoPor: 'coordinadora',
  }

  it('pasa a mayúsculas los datos y deja los correos como se escribieron', () => {
    const out = datosEnMayusculas(input, new Set(['participante.email']))
    expect(out.nombre).toBe('MARÍA PEÑA')
    expect(out.ciudad).toBe('BOGOTÁ')
    expect(out.telefonos).toEqual(['300 123 4567 (MAMÁ)'])
    expect(out.camposExtra).toEqual({ marca: 'NIVEA', 'participante.email': 'Ana@Correo.com' })
    expect(out.proyectoId).toBe('abc-1')
    expect(out.creadoPor).toBe('coordinadora')
  })

  // La versión identifica el texto que se le leyó a la persona: en mayúsculas
  // no coincidiría con la que guarda la API y la autorización no probaría nada.
  it('no toca la autorización de datos ni su versión', () => {
    const out = datosEnMayusculas({
      ...input,
      autorizacionDatos: true,
      autorizacionVersion: VERSION_AUTORIZACION_DATOS,
    })
    expect(out.autorizacionDatos).toBe(true)
    expect(out.autorizacionVersion).toBe(VERSION_AUTORIZACION_DATOS)
  })
})
