import { describe, expect, it } from 'vitest'
import { normalizeCamposBase } from '@modules/proyectos/application/formularioConfigHelpers'
import { areCamposEqual } from '@modules/proyectos/application/camposEspecificosHelpers'

describe('normalizeCamposBase', () => {
  it('repone nombre y documento si un diseño guardado los había quitado', () => {
    const campos = normalizeCamposBase([{ nombreCampo: 'ciudad', etiqueta: 'Ciudad' }], ['Cali'])
    expect(campos.map((campo) => campo.nombreCampo)).toEqual(['nombre', 'documento', 'ciudad'])
  })

  it('mantiene nombre y documento obligatorios aunque se guardaran opcionales', () => {
    const campos = normalizeCamposBase([
      { nombreCampo: 'nombre', etiqueta: 'Nombre', requerido: false },
      { nombreCampo: 'documento', etiqueta: 'Documento', requerido: false },
      { nombreCampo: 'telefono', etiqueta: 'Teléfono', requerido: false },
    ])
    expect(campos.map((campo) => campo.requerido)).toEqual([true, true, false])
  })
})

describe('areCamposEqual', () => {
  it('cuenta un cambio de destino como cambio', () => {
    const campo = { nombreCampo: 'x', etiqueta: 'Dato', tipo: 'text' as const, destino: 'participante.email' }
    expect(areCamposEqual([campo], [{ ...campo, destino: 'participante.address' }])).toBe(false)
  })
})
