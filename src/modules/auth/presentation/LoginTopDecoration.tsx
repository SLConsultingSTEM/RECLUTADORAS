import styles from './LoginTopDecoration.module.css'

/**
 * Header decorativo: banda sólida arriba + scallops circulares colgando hacia abajo.
 *
 * En SVG (y↓), de L→R el sweep-flag 0 traza el semicírculo inferior.
 * Radios: 36, 24, 55, 35, 50 (diámetros 72+48+110+70+100 = 400).
 */
const SCALLOPED_PATH =
  'M0 0 ' +
  'V48 ' +
  'A36 36 0 0 0 72 48 ' +
  'A24 24 0 0 0 120 48 ' +
  'A55 55 0 0 0 230 48 ' +
  'A35 35 0 0 0 300 48 ' +
  'A50 50 0 0 0 400 48 ' +
  'V0 ' +
  'H0 ' +
  'Z'

/**
 * Decoración superior del login (mobile). Pura, no interactiva.
 */
export function LoginTopDecoration() {
  return (
    <div className={styles.root} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 400 110"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={SCALLOPED_PATH} fill="currentColor" shapeRendering="geometricPrecision" />
      </svg>
    </div>
  )
}
