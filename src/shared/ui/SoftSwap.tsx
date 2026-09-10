import { useEffect, useState, type ReactNode } from 'react'
import styles from './SoftSwap.module.css'

interface SoftSwapProps {
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Cruza skeleton ↔ contenido con fade, sin cortes bruscos ni saltos de layout.
 */
export function SoftSwap({ loading, skeleton, children, className = '' }: SoftSwapProps) {
  const [hasContent, setHasContent] = useState(!loading)

  useEffect(() => {
    if (!loading) setHasContent(true)
  }, [loading])

  return (
    <div className={`${styles.host} ${className}`}>
      <div
        className={`${styles.layer} ${loading ? styles.visible : styles.hidden}`}
        aria-hidden={!loading}
      >
        {skeleton}
      </div>
      <div
        className={`${styles.layer} ${hasContent && !loading ? styles.visible : styles.hidden}`}
        aria-hidden={loading || !hasContent}
      >
        {hasContent ? children : null}
      </div>
    </div>
  )
}
