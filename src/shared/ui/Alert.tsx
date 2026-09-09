import type { ReactNode } from 'react'
import { IconAlertCircle, IconCheckCircle, IconInfo } from './icons'
import styles from './Alert.module.css'

type Tone = 'info' | 'success' | 'error'

interface AlertProps {
  tone?: Tone
  children: ReactNode
  title?: string
}

const ICONS: Record<Tone, ReactNode> = {
  info: <IconInfo size={18} />,
  success: <IconCheckCircle size={18} />,
  error: <IconAlertCircle size={18} />,
}

export function Alert({ tone = 'info', children, title }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role="status">
      <span className={styles.icon}>{ICONS[tone]}</span>
      <div className={styles.body}>
        {title ? <strong className={styles.title}>{title}</strong> : null}
        <span>{children}</span>
      </div>
    </div>
  )
}
