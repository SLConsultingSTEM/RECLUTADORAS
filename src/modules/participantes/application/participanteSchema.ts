import { z } from 'zod'
import type { CampoEspecifico } from '@modules/proyectos/domain/types'

const baseSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre requerido'),
  documento: z.string().trim().min(5, 'Documento inválido'),
  ciudad: z.string().trim().min(1, 'Ciudad requerida'),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{7,15}$/, 'Teléfono inválido'),
})

export function buildParticipanteSchema(campos: CampoEspecifico[]) {
  const extraShape: Record<string, z.ZodType<string>> = {}

  for (const campo of campos) {
    let field = z.string().trim()
    if (campo.requerido !== false) {
      field = field.min(1, `${campo.etiqueta} es obligatorio`)
    }
    extraShape[campo.nombreCampo] = field
  }

  return baseSchema.extend({
    camposExtra: z.object(extraShape),
  })
}

export type ParticipanteFormValues = z.infer<ReturnType<typeof buildParticipanteSchema>>
