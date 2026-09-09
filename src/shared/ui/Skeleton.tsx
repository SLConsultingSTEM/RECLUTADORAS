import styles from './Skeleton.module.css'

interface SkeletonProps {
  /** Número de líneas a mostrar */
  lines?: number
  height?: number
  radius?: number
}

export function Skeleton({ lines = 1, height = 14, radius = 8 }: SkeletonProps) {
  return (
    <div className={styles.stack} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={styles.line}
          style={{
            height: `${height}px`,
            borderRadius: `${radius}px`,
            width: lines > 1 && index === lines - 1 ? '65%' : '100%',
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonBlockProps {
  height?: number
}

export function SkeletonBlock({ height = 120 }: SkeletonBlockProps) {
  return (
    <span
      className={styles.line}
      style={{ height: `${height}px`, borderRadius: 'var(--radius-md)', display: 'block' }}
      aria-hidden="true"
    />
  )
}

export function LoadingRow({ label }: { label: string }) {
  return (
    <div className={styles.loadingRow} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
