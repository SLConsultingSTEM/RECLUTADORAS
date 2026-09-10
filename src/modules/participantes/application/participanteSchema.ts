import { z } from 'zod'
import type { CampoEspecifico } from '@modules/proyectos/domain/types'

const baseSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio'),
  tipoDocumento: z.enum(['CC', 'CE'], {
    error: 'Selecciona el tipo de documento',
  }),
  documento: z.string().trim().min(5, 'El documento no es válido'),
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

export function buildParticipanteSchema(campos: CampoEspecifico[]) {
  const extraShape: Record<string, z.ZodType<string>> = {}

  for (const campo of campos) {
    extraShape[campo.nombreCampo] = campoTextoSchema(
      campo.etiqueta,
      campo.requerido !== false,
    ) as z.ZodType<string>
  }

  return baseSchema.extend({
    camposExtra: z.object(extraShape),
  })
}

export type ParticipanteFormValues = z.infer<ReturnType<typeof buildParticipanteSchema>>
