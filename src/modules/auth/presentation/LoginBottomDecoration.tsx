import styles from './LoginBottomDecoration.module.css'

/**
 * Pie decorativo: dos olas con valle desplazado a la izquierda
 * (no centrado) y subida larga hacia la derecha.
 */
const WAVE_BACK =
  'M0 120 ' +
  'L0 56 ' +
  'C 55 56 75 92 125 92 ' +
  'C 210 92 290 48 400 40 ' +
  'L400 120 ' +
  'Z'

const WAVE_FRONT =
  'M0 120 ' +
  'L0 64 ' +
  'C 65 64 85 98 140 98 ' +
  'C 220 98 300 54 400 48 ' +
  'L400 120 ' +
  'Z'

/**
 * Decoración inferior del login (mobile). Pura, no interactiva.
 */
export function LoginBottomDecoration() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path className={styles.waveBack} d={WAVE_BACK} shapeRendering="geometricPrecision" />
        <path className={styles.waveFront} d={WAVE_FRONT} shapeRendering="geometricPrecision" />
      </svg>
    </div>
  )
}
