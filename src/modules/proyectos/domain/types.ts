export type CampoTipo = 'text' | 'select' | 'number' | 'date'

export interface CampoEspecifico {
  nombreCampo: string
  etiqueta: string
  tipo: CampoTipo
  opciones?: string[]
  requerido?: boolean
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
  camposEspecificos: CampoEspecifico[]
  activo: boolean
}

export interface ProyectoRepository {
  list(): Promise<Proyecto[]>
  getById(id: string): Promise<Proyecto | null>
  save(proyecto: Proyecto): Promise<Proyecto>
  remove(id: string): Promise<void>
}
