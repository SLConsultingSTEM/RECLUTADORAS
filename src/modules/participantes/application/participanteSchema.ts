import { z } from 'zod'
import type { CampoBaseConfig, CampoEspecifico } from '@modules/proyectos/domain/types'
import { normalizeCamposBase } from '@modules/proyectos/application/formularioConfigHelpers'

/** Normaliza valores ausentes para evitar mensajes en inglés de Zod (`undefined` / `null`). */
function campoTextoSchema(etiqueta: string, requerido: boolean, min = 1) {
  const mensajeVacio = `Completa el campo «${etiqueta}»`

  return z.preprocess(
    (value) => (value == null ? '' : String(value)),
    requerido
      ? z.string().trim().min(min, mensajeVacio)
      : z.string().trim(),
  )
}

function optionalOrEnum<T extends string>(
  values: readonly [T, ...T[]],
  requerido: boolean,
  etiqueta: string,
) {
  const emptyOk = z.union([z.literal(''), z.enum(values)])
  if (!requerido) {
    return z.preprocess((value) => (value == null ? '' : value), emptyOk)
  }

  return z.preprocess(
    (value) => (value == null ? '' : value),
    z
      .string()
      .trim()
      .min(1, `Selecciona «${etiqueta}»`)
      .refine((value): value is T => (values as readonly string[]).includes(value), {
        message: `Selecciona «${etiqueta}»`,
      }),
  )
}

function optionalOrOneOf(opciones: string[], requerido: boolean, etiqueta: string) {
  const cleaned = opciones.map((opcion) => opcion.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    return campoTextoSchema(etiqueta, requerido, 1)
  }
  return optionalOrEnum(cleaned as [string, ...string[]], requerido, etiqueta)
}

function emptyBaseField() {
  return z.preprocess((value) => (value == null ? '' : String(value)), z.string())
}

function buildBaseShape(camposBase: CampoBaseConfig[]) {
  const byKey = new Map(normalizeCamposBase(camposBase).map((campo) => [campo.nombreCampo, campo]))

  const nombre = byKey.get('nombre')
  const genero = byKey.get('genero')
  const tipoDocumento = byKey.get('tipoDocumento')
  const documento = byKey.get('documento')
  const ciudad = byKey.get('ciudad')
  const telefono = byKey.get('telefono')

  return {
    nombre: nombre
      ? campoTextoSchema(nombre.etiqueta, Boolean(nombre.requerido), 2)
      : emptyBaseField(),
    tipoDocumento: tipoDocumento
      ? optionalOrOneOf(
          tipoDocumento.opciones ?? ['CC', 'CE'],
          Boolean(tipoDocumento.requerido),
          tipoDocumento.etiqueta,
        )
      : emptyBaseField(),
    documento: documento
      ? campoTextoSchema(documento.etiqueta, Boolean(documento.requerido), 5)
      : emptyBaseField(),
    genero: genero
      ? optionalOrOneOf(
          genero.opciones ?? ['Masculino', 'Femenino'],
          Boolean(genero.requerido),
          genero.etiqueta,
        )
      : emptyBaseField(),
    ciudad: ciudad
      ? optionalOrOneOf(
          ciudad.opciones ?? [],
          Boolean(ciudad.requerido),
          ciudad.etiqueta,
        )
      : emptyBaseField(),
    telefono: telefono
      ? z.preprocess((value) => (value == null ? '' : String(value)), (() => {
          const valid = z
            .string()
            .trim()
            .regex(/^\d{7,15}$/, `El campo «${telefono.etiqueta}» debe tener entre 7 y 15 dígitos`)
          return telefono.requerido ? valid : z.union([z.literal(''), valid])
        })())
      : emptyBaseField(),
  }
}

export interface BuildParticipanteSchemaOptions {
  /** Si es false, los campos del filtro del estudio quedan opcionales (p. ej. rol reclutadora). */
  requireCamposEspecificos?: boolean
  camposBase?: CampoBaseConfig[]
}

export function buildParticipanteSchema(
  campos: CampoEspecifico[],
  options: BuildParticipanteSchemaOptions = {},
) {
  const requireExtras = options.requireCamposEspecificos !== false
  const extraShape: Record<string, z.ZodType<string>> = {}

  for (const campo of campos) {
    const requerido = requireExtras && campo.requerido !== false
    extraShape[campo.nombreCampo] = campoTextoSchema(
      campo.etiqueta,
      requerido,
    ) as z.ZodType<string>
  }

  return z.object({
    ...buildBaseShape(options.camposBase ?? []),
    camposExtra: z.object(extraShape),
  })
}

export type ParticipanteFormValues = z.infer<ReturnType<typeof buildParticipanteSchema>>
