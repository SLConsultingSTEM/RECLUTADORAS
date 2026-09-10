import { useId } from 'react'
import styles from './LoginDivider.module.css'

/**
 * Borde en S moderada (viewBox 0 0 100 100).
 * Más puntos de control = silueta más limpia al escalar.
 */
const PATH =
  'M10.5 0 C8.8 8 5.2 16 5.8 24 C6.4 32 11.2 40 10.8 48 C10.4 56 5.2 64 6.2 72 C7.2 80 12 88 10.5 100 L100 100 L100 0 Z'

/**
 * Fondo del panel derecho con borde orgánico fijo.
 * SVG vectorial (evita el antialias borroso de clip-path en HTML).
 */
export function LoginDivider() {
  const rawId = useId()
  const uid = rawId.replace(/:/g, '')
  const gradMain = `login-grad-main-${uid}`
  const gradA = `login-grad-a-${uid}`
  const gradB = `login-grad-b-${uid}`

  return (
    <div className={styles.divider} aria-hidden="true">
      <svg
        className={styles.bleed}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradMain} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#531f73" />
            <stop offset="42%" stopColor="#67298C" />
            <stop offset="100%" stopColor="#7d3aa8" />
          </linearGradient>
          <radialGradient id={gradA} cx="22%" cy="12%" r="55%">
            <stop offset="0%" stopColor="#9b51e0" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#9b51e0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gradB} cx="92%" cy="78%" r="50%">
            <stop offset="0%" stopColor="#67298C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#67298C" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path d={PATH} fill={`url(#${gradMain})`} shapeRendering="geometricPrecision" />
        <path d={PATH} fill={`url(#${gradA})`} shapeRendering="geometricPrecision" />
        <path d={PATH} fill={`url(#${gradB})`} shapeRendering="geometricPrecision" />
      </svg>
    </div>
  )
}
