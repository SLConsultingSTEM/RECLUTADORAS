/**
 * Autorización de tratamiento de datos personales (Ley 1581 de 2012).
 *
 * El texto y su versión viven juntos a propósito: lo que se guarda en
 * `person.data_consent_version` es lo único que dice a qué autorizó cada
 * persona, así que una versión que no corresponda al texto que se leyó vale
 * menos que nada. **Al cambiar cualquier palabra de abajo hay que subir la
 * versión**, nunca reescribir el texto dejando la versión anterior.
 */
export const VERSION_AUTORIZACION_DATOS = 'ley-1581-v1'

/** Lo que la reclutadora confirma al marcar la casilla. */
export const AUTORIZACION_DATOS_RESUMEN =
  'El participante autorizó el tratamiento de sus datos personales (Ley 1581 de 2012).'

/** El detalle de a qué autorizó, bajo el resumen. */
export const AUTORIZACION_DATOS_DETALLE =
  'Confirmo que le informé la finalidad —reclutamiento y participación en estudios ' +
  'de mercado— y que autorizó de forma previa, expresa e informada que SL Research ' +
  'Colombia S.A.S. recolecte, almacene y use sus datos, conservando su derecho a ' +
  'conocerlos, actualizarlos, rectificarlos y suprimirlos.'
