import type {
  CampoBaseConfig,
  CampoBaseInputTipo,
  CampoBaseKey,
  FormularioTitulos,
  Proyecto,
} from '@modules/proyectos/domain/types'

export const CAMPO_BASE_KEYS: CampoBaseKey[] = [
  'nombre',
  'genero',
  'tipoDocumento',
  'documento',
  'ciudad',
  'telefono',
]

const DEFAULT_BASE_LABELS: Record<CampoBaseKey, string> = {
  nombre: 'Nombre completo',
  genero: 'Género',
  tipoDocumento: 'Tipo de documento',
  documento: 'Documento',
  ciudad: 'Ciudad',
  telefono: 'Teléfono',
}

const DEFAULT_BASE_REQUIRED: Record<CampoBaseKey, boolean> = {
  nombre: true,
  genero: false,
  tipoDocumento: false,
  documento: true,
  ciudad: true,
  telefono: true,
}

const TEXT_LIKE_BASE_KEYS: CampoBaseKey[] = ['nombre', 'documento', 'telefono']
const SELECT_LIKE_BASE_KEYS: CampoBaseKey[] = ['genero', 'tipoDocumento', 'ciudad']

const DEFAULT_BASE_TIPO: Record<'nombre' | 'documento' | 'telefono', CampoBaseInputTipo> = {
  nombre: 'text',
  documento: 'text',
  telefono: 'text',
}

const DEFAULT_BASE_OPCIONES: Record<'genero' | 'tipoDocumento', string[]> = {
  genero: ['Masculino', 'Femenino'],
  tipoDocumento: ['CC', 'CE'],
}

const BASE_INPUT_TIPOS: CampoBaseInputTipo[] = [
  'text',
  'number',
  'date',
  'email',
  'tel',
  'textarea',
]

function isCampoBaseInputTipo(value: unknown): value is CampoBaseInputTipo {
  return typeof value === 'string' && (BASE_INPUT_TIPOS as string[]).includes(value)
}

export function isTextLikeBaseCampo(nombreCampo: CampoBaseKey) {
  return TEXT_LIKE_BASE_KEYS.includes(nombreCampo)
}

export function isSelectLikeBaseCampo(nombreCampo: CampoBaseKey) {
  return SELECT_LIKE_BASE_KEYS.includes(nombreCampo)
}

export function defaultOpcionesForBaseCampo(
  nombreCampo: CampoBaseKey,
  ciudadesPermitidas: string[] = [],
): string[] {
  if (nombreCampo === 'genero') return [...DEFAULT_BASE_OPCIONES.genero]
  if (nombreCampo === 'tipoDocumento') return [...DEFAULT_BASE_OPCIONES.tipoDocumento]
  if (nombreCampo === 'ciudad') return [...ciudadesPermitidas]
  return []
}

function normalizeOpciones(opciones?: string[] | null, fallback: string[] = []) {
  const cleaned = (opciones ?? [])
    .map((opcion) => opcion.trim())
    .filter(Boolean)
  return cleaned.length > 0 ? cleaned : [...fallback]
}

export const DEFAULT_FORMULARIO_TITULOS: FormularioTitulos = {
  base: {
    eyebrow: 'Datos base',
    titulo: 'Información del participante',
  },
  filtro: {
    eyebrow: 'Filtro del estudio',
    titulo: 'Campos del proyecto',
  },
}

export type CampoBaseEditable = CampoBaseConfig & { id: string }

function createId(key: string) {
  return `base-${key}`
}

export function defaultCamposBase(ciudadesPermitidas: string[] = []): CampoBaseConfig[] {
  return CAMPO_BASE_KEYS.map((nombreCampo) => ({
    nombreCampo,
    etiqueta: DEFAULT_BASE_LABELS[nombreCampo],
    requerido: DEFAULT_BASE_REQUIRED[nombreCampo],
    ...(isTextLikeBaseCampo(nombreCampo)
      ? { tipo: DEFAULT_BASE_TIPO[nombreCampo as 'nombre' | 'documento' | 'telefono'] }
      : {}),
    ...(isSelectLikeBaseCampo(nombreCampo)
      ? { opciones: defaultOpcionesForBaseCampo(nombreCampo, ciudadesPermitidas) }
      : {}),
  }))
}

export function normalizeCamposBase(
  campos?: CampoBaseConfig[] | null,
  ciudadesPermitidas: string[] = [],
): CampoBaseConfig[] {
  if (campos == null) return defaultCamposBase(ciudadesPermitidas)
  if (campos.length === 0) return []

  const seen = new Set<CampoBaseKey>()
  const ordered: CampoBaseConfig[] = []

  for (const campo of campos) {
    if (!CAMPO_BASE_KEYS.includes(campo.nombreCampo) || seen.has(campo.nombreCampo)) continue
    seen.add(campo.nombreCampo)
    const next: CampoBaseConfig = {
      nombreCampo: campo.nombreCampo,
      etiqueta: campo.etiqueta.trim() || DEFAULT_BASE_LABELS[campo.nombreCampo],
      requerido: campo.requerido ?? DEFAULT_BASE_REQUIRED[campo.nombreCampo],
    }
    if (isTextLikeBaseCampo(campo.nombreCampo)) {
      const fallback = DEFAULT_BASE_TIPO[campo.nombreCampo as 'nombre' | 'documento' | 'telefono']
      next.tipo = isCampoBaseInputTipo(campo.tipo) ? campo.tipo : fallback
    }
    if (isSelectLikeBaseCampo(campo.nombreCampo)) {
      next.opciones = normalizeOpciones(
        campo.opciones,
        defaultOpcionesForBaseCampo(campo.nombreCampo, ciudadesPermitidas),
      )
    }
    ordered.push(next)
  }

  return ordered
}

export function normalizeFormularioTitulos(
  titulos?: FormularioTitulos | null,
): FormularioTitulos {
  return {
    base: {
      eyebrow: titulos?.base.eyebrow?.trim() || DEFAULT_FORMULARIO_TITULOS.base.eyebrow,
      titulo: titulos?.base.titulo?.trim() || DEFAULT_FORMULARIO_TITULOS.base.titulo,
    },
    filtro: {
      eyebrow: titulos?.filtro.eyebrow?.trim() || DEFAULT_FORMULARIO_TITULOS.filtro.eyebrow,
      titulo: titulos?.filtro.titulo?.trim() || DEFAULT_FORMULARIO_TITULOS.filtro.titulo,
    },
  }
}

export function toEditableCamposBase(
  campos?: CampoBaseConfig[] | null,
  ciudadesPermitidas: string[] = [],
): CampoBaseEditable[] {
  return normalizeCamposBase(campos, ciudadesPermitidas).map((campo) => ({
    ...campo,
    id: createId(campo.nombreCampo),
    opciones: campo.opciones ? [...campo.opciones] : undefined,
  }))
}

export function toPersistableCamposBase(
  campos: CampoBaseEditable[],
  ciudadesPermitidas: string[] = [],
): CampoBaseConfig[] {
  return normalizeCamposBase(
    campos.map(({ id: _id, ...campo }) => ({
      ...campo,
      etiqueta: campo.etiqueta.trim() || DEFAULT_BASE_LABELS[campo.nombreCampo],
      opciones: campo.opciones
        ? campo.opciones.map((opcion) => opcion.trim()).filter(Boolean)
        : undefined,
    })),
    ciudadesPermitidas,
  )
}

export function areCamposBaseEqual(
  a: CampoBaseConfig[],
  b: CampoBaseConfig[],
  ciudadesPermitidas: string[] = [],
): boolean {
  const left = normalizeCamposBase(a, ciudadesPermitidas)
  const right = normalizeCamposBase(b, ciudadesPermitidas)
  if (left.length !== right.length) return false
  return left.every((campo, index) => {
    const other = right[index]
    if (!other) return false
    return (
      campo.nombreCampo === other.nombreCampo &&
      campo.etiqueta === other.etiqueta &&
      Boolean(campo.requerido) === Boolean(other.requerido) &&
      (campo.tipo ?? 'text') === (other.tipo ?? 'text') &&
      JSON.stringify(campo.opciones ?? []) === JSON.stringify(other.opciones ?? [])
    )
  })
}

export function areFormularioTitulosEqual(
  a: FormularioTitulos,
  b: FormularioTitulos,
): boolean {
  const left = normalizeFormularioTitulos(a)
  const right = normalizeFormularioTitulos(b)
  return (
    left.base.eyebrow === right.base.eyebrow &&
    left.base.titulo === right.base.titulo &&
    left.filtro.eyebrow === right.filtro.eyebrow &&
    left.filtro.titulo === right.filtro.titulo
  )
}

export function resolveProyectoFormulario(proyecto: Proyecto) {
  return {
    camposBase: normalizeCamposBase(proyecto.camposBase, proyecto.ciudadesPermitidas),
    titulosFormulario: normalizeFormularioTitulos(proyecto.titulosFormulario),
  }
}

export function moveItem<T>(items: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta
  if (index < 0 || target < 0 || target >= items.length) return items
  const next = [...items]
  const [item] = next.splice(index, 1)
  if (!item) return items
  next.splice(target, 0, item)
  return next
}
