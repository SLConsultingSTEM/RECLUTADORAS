import { z } from 'zod'
import type { CampoEspecifico } from '@modules/proyectos/domain/types'

const baseSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio'),
  tipoDocumento: z.preprocess(
    (value) => (value == null ? '' : value),
    z.union([z.literal(''), z.enum(['CC', 'CE'])]),
  ),
  documento: z.string().trim().min(5, 'El documento no es válido'),
  genero: z.preprocess(
    (value) => (value == null ? '' : value),
    z.union([z.literal(''), z.enum(['Masculino', 'Femenino'])]),
  ),
  ciudad: z.string().trim().min(1, 'Selecciona una ciudad'),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, 'El teléfono debe tener entre 7 y 15 dígitos'),
})

/** Normaliza valores ausentes para evitar mensajes en inglés de Zod (`undefined` / `null`). */
function campoTextoSchema(etiqueta: string, requerido: boolean) {
  const mensajeVacio = `Completa el campo «${etiqueta}»`

  return z.preprocess(
    (value) => (value == null ? '' : String(value)),
    requerido
      ? z.string().trim().min(1, mensajeVacio)
      : z.string().trim(),
  )
}

export interface BuildParticipanteSchemaOptions {
  /** Si es false, los campos del filtro del estudio quedan opcionales (p. ej. rol reclutadora). */
  requireCamposEspecificos?: boolean
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

  return baseSchema.extend({
    camposExtra: z.object(extraShape),
  })
}

export type ParticipanteFormValues = z.infer<ReturnType<typeof buildParticipanteSchema>>
