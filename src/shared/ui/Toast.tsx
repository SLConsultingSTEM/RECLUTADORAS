import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconAlertCircle, IconCheckCircle, IconClose, IconInfo } from './icons'
import styles from './Toast.module.css'

type Tone = 'info' | 'success' | 'error'

interface ToastProps {
  tone?: Tone
  children: ReactNode
  title?: string
  /** ms; 0 = no auto-dismiss */
  duration?: number
  onClose?: () => void
}

const ICONS: Record<Tone, ReactNode> = {
  info: <IconInfo size={18} />,
  success: <IconCheckCircle size={18} />,
  error: <IconAlertCircle size={18} />,
}

const DEFAULT_DURATION: Record<Tone, number> = {
  info: 4000,
  success: 4000,
  error: 6000,
}

const EXIT_MS = 260

export function Toast({
  tone = 'info',
  children,
  title,
  duration,
  onClose,
}: ToastProps) {
  const dismissMs = duration ?? DEFAULT_DURATION[tone]
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const closingRef = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setVisible(true))
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  function requestClose() {
    if (closingRef.current) return
    closingRef.current = true
    setVisible(false)
  }

  useEffect(() => {
    if (dismissMs <= 0 || !onCloseRef.current) return
    const id = window.setTimeout(requestClose, dismissMs)
    return () => window.clearTimeout(id)
  }, [children, dismissMs, title, tone])

  useEffect(() => {
    if (visible || !closingRef.current) return
    const id = window.setTimeout(() => onCloseRef.current?.(), EXIT_MS)
    return () => window.clearTimeout(id)
  }, [visible])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={styles.viewport} role="status" aria-live="polite">
      <div
        className={`${styles.toast} ${styles[tone]} ${visible ? styles.open : styles.leaving}`}
      >
        <span className={styles.icon}>{ICONS[tone]}</span>
        <div className={styles.body}>
          {title ? <strong className={styles.title}>{title}</strong> : null}
          <span>{children}</span>
        </div>
        {onClose ? (
          <button
            type="button"
            className={styles.close}
            aria-label="Cerrar mensaje"
            onClick={requestClose}
          >
            <IconClose size={16} />
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
