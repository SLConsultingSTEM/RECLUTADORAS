import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  subtle?: boolean
}

export function Badge({ tone = 'neutral', icon, children, subtle = false }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${subtle ? styles.subtle : ''}`}>
      {icon ? <span className={styles.icon}>{icon}</span> : <span className={styles.dot} />}
      {children}
    </span>
  )
}
