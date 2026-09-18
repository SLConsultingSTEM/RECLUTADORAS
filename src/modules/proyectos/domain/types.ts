export type CampoTipo = 'text' | 'select' | 'number' | 'date' | 'email' | 'tel' | 'textarea'

export type CampoBaseKey =
  | 'nombre'
  | 'genero'
  | 'tipoDocumento'
  | 'documento'
  | 'ciudad'
  | 'telefono'

export interface CampoEspecifico {
  nombreCampo: string
  etiqueta: string
  tipo: CampoTipo
  opciones?: string[]
  requerido?: boolean
  /**
   * Dónde se guarda el dato en la base: el path del cuestionario del estudio
   * ("Datos.acidity.Marca1") o "dependiente.<columna>" para los datos del bebé.
   * Un campo sin destino no se guarda.
   */
  destino?: string
}

/** Opción del selector "se guarda en", que publica la API por estudio. */
export interface DestinoCampo {
  valor: string
  etiqueta: string
  fuente: 'questionnaire' | 'dependent' | 'person'
}

export type CampoBaseInputTipo = Exclude<CampoTipo, 'select'>

/** Configuración editable de los campos fijos del participante. */
export interface CampoBaseConfig {
  nombreCampo: CampoBaseKey
  etiqueta: string
  requerido?: boolean
  /** Solo aplica a nombre, documento y teléfono. */
  tipo?: CampoBaseInputTipo
  /** Opciones de lista para género, tipo de documento y ciudad. */
  opciones?: string[]
}

export interface FormularioSeccionTitulos {
  eyebrow: string
  titulo: string
}

export interface FormularioTitulos {
  base: FormularioSeccionTitulos
  filtro: FormularioSeccionTitulos
}

export interface Proyecto {
  id: string
  nombre: string
  descripcionHtml: string
  /** Ruta pública de la pieza gráfica, ej. /proyectos/RCL.png */
  imagenUrl: string
  /** Nombre de archivo al descargar */
  imagenNombre: string
  ciudadesPermitidas: string[]
  /** Labels/orden/requerido de datos base (opcional: se usan defaults). */
  camposBase?: CampoBaseConfig[]
  /** Títulos de secciones del formulario de registro. */
  titulosFormulario?: FormularioTitulos
  camposEspecificos: CampoEspecifico[]
  /** Destinos que admite este estudio; los publica la API. */
  destinosDisponibles?: DestinoCampo[]
  activo: boolean
}

/** Resultado de subir la pieza gráfica: la imagen vive en Cloudinary. */
export interface PiezaSubida {
  imagenUrl: string
  imagenNombre: string
}

export interface ProyectoRepository {
  list(): Promise<Proyecto[]>
  getById(id: string): Promise<Proyecto | null>
  save(proyecto: Proyecto): Promise<Proyecto>
  remove(id: string): Promise<void>
  /** Solo la implementación HTTP; el mock trabaja con data URLs locales. */
  uploadPieza?(id: string, file: File): Promise<PiezaSubida>
}
