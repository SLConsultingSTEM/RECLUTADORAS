import type { CampoEspecifico, CampoTipo } from '@modules/proyectos/domain/types'

export type CampoEditable = CampoEspecifico & { id: string }

function createId() {
  return `campo-${crypto.randomUUID().slice(0, 8)}`
}

export function slugifyCampo(etiqueta: string): string {
  const base = etiqueta
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48)

  return base || 'campo'
}

export function ensureUniqueNombreCampo(
  desired: string,
  items: Array<{ nombreCampo: string; id?: string }>,
  currentId?: string,
): string {
  const taken = new Set(
    items
      .filter((item) => item.id !== currentId)
      .map((item) => item.nombreCampo),
  )

  if (!taken.has(desired)) return desired

  let suffix = 2
  while (taken.has(`${desired}_${suffix}`)) suffix += 1
  return `${desired}_${suffix}`
}

export function createEmptyCampo(existing: CampoEditable[] = []): CampoEditable {
  const nombreCampo = ensureUniqueNombreCampo(
    `campo_${crypto.randomUUID().slice(0, 6)}`,
    existing,
  )
  return {
    id: createId(),
    nombreCampo,
    etiqueta: '',
    tipo: 'text',
    requerido: true,
  }
}

export function duplicateCampo(
  source: CampoEditable,
  existing: CampoEditable[],
): CampoEditable {
  const baseEtiqueta = source.etiqueta.trim() || 'Nuevo campo'
  const etiqueta = `${baseEtiqueta} (copia)`
  const nombreCampo = ensureUniqueNombreCampo(
    slugifyCampo(etiqueta) || `campo_${crypto.randomUUID().slice(0, 6)}`,
    existing,
  )

  return {
    id: createId(),
    nombreCampo,
    etiqueta,
    tipo: source.tipo,
    requerido: Boolean(source.requerido),
    opciones: source.tipo === 'select' ? [...(source.opciones ?? [])] : undefined,
  }
}

export function toEditableCampos(campos: CampoEspecifico[]): CampoEditable[] {
  return campos.map((campo) => ({
    ...campo,
    id: createId(),
    opciones: campo.opciones ? [...campo.opciones] : undefined,
  }))
}

export function toPersistableCampos(campos: CampoEditable[]): CampoEspecifico[] {
  const result: CampoEspecifico[] = []

  for (const campo of campos) {
    const etiqueta = campo.etiqueta.trim() || 'Nuevo campo'
    const nombreCampo = ensureUniqueNombreCampo(
      campo.nombreCampo || slugifyCampo(etiqueta),
      result.map((item) => ({ nombreCampo: item.nombreCampo })),
    )

    const next: CampoEspecifico = {
      nombreCampo,
      etiqueta,
      tipo: campo.tipo,
      requerido: Boolean(campo.requerido),
    }

    if (campo.tipo === 'select') {
      next.opciones = (campo.opciones ?? [])
        .map((opcion) => opcion.trim())
        .filter(Boolean)
    }

    result.push(next)
  }

  return result
}

export const CAMPO_TIPO_OPTIONS: Array<{ value: CampoTipo; label: string }> = [
  { value: 'text', label: 'Texto' },
  { value: 'select', label: 'Lista' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Teléfono' },
  { value: 'textarea', label: 'Párrafo' },
]

export function htmlTypeForCampo(tipo: CampoTipo | undefined): 'text' | 'number' | 'date' | 'email' | 'tel' {
  switch (tipo) {
    case 'number':
      return 'number'
    case 'date':
      return 'date'
    case 'email':
      return 'email'
    case 'tel':
      return 'tel'
    default:
      return 'text'
  }
}

export function isMultilineCampo(tipo: CampoTipo | undefined) {
  return tipo === 'textarea'
}

export function placeholderForCampoTipo(
  tipo: CampoTipo | undefined,
  etiqueta: string,
): string | undefined {
  const label = etiqueta.trim() || 'valor'
  const soft = label.toLowerCase()

  switch (tipo) {
    case 'number':
      return `Ingresa ${soft}`
    case 'date':
      return undefined
    case 'email':
      return 'Ej. nombre@correo.com'
    case 'tel':
      return 'Ej. 3001234567'
    case 'textarea':
      return `Escribe ${soft}`
    case 'select':
      return undefined
    case 'text':
    default:
      return `Escribe ${soft}`
  }
}

export function labelForTipo(tipo: CampoTipo): string {
  return CAMPO_TIPO_OPTIONS.find((item) => item.value === tipo)?.label ?? tipo
}

export function areCamposEqual(a: CampoEspecifico[], b: CampoEspecifico[]): boolean {
  if (a.length !== b.length) return false

  return a.every((campo, index) => {
    const other = b[index]
    if (!other) return false
    return (
      campo.nombreCampo === other.nombreCampo &&
      campo.etiqueta === other.etiqueta &&
      campo.tipo === other.tipo &&
      Boolean(campo.requerido) === Boolean(other.requerido) &&
      JSON.stringify(campo.opciones ?? []) === JSON.stringify(other.opciones ?? [])
    )
  })
}
