import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

type StatTone = 'primary' | 'accent' | 'success' | 'info' | 'warning'

interface StatCardProps {
  label: string
  value: ReactNode
  detail?: string
  icon?: ReactNode
  tone?: StatTone
  delay?: number
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = 'primary',
  delay = 0,
}: StatCardProps) {
  return (
    <article
      className={`${styles.stat} ${styles[tone]}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
      </div>
      <strong className={styles.value}>{value}</strong>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </article>
  )
}
