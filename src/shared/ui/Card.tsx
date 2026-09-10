import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  /** Retardo de entrada en ms para escalonar la animación */
  delay?: number
  padding?: 'none' | 'sm' | 'md'
  /** Desactiva la animación de entrada (evita titileo al recargar). */
  animate?: boolean
}

export function Card({
  children,
  className = '',
  delay = 0,
  padding = 'md',
  animate = false,
}: CardProps) {
  return (
    <section
      className={`${styles.card} ${styles[padding]} ${animate ? styles.animated : styles.static} ${className}`}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: string
  eyebrow?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function CardHeader({ title, eyebrow, icon, actions }: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headingGroup}>
        {icon ? <span className={styles.headerIcon}>{icon}</span> : null}
        <div className={styles.headingText}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
