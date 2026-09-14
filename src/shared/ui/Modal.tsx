import { useEffect, useId, useRef, useState, type AnimationEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@shared/ui/Button'
import { IconClose } from '@shared/ui/icons'
import styles from './Modal.module.css'

const CLOSE_MS = 320

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Texto accesible del diálogo */
  description?: string
  size?: 'md' | 'lg'
  headerAside?: ReactNode
  /** Oculta la franja de título; el contenido debe incluir su propio cierre si hace falta. */
  hideTitle?: boolean
  /** En móvil: sheet (abajo) o center (tarjeta centrada). */
  placement?: 'sheet' | 'center'
}

export function Modal({
  open,
  title,
  onClose,
  children,
  description,
  size = 'md',
  headerAside,
  hideTitle = false,
  placement = 'sheet',
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (open) {
      setMounted(true)
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false)
      closeTimerRef.current = null
    }, CLOSE_MS)

    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!mounted) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && visible) onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted, visible, onClose])

  function handleDialogAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (!open && !visible) setMounted(false)
  }

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`${styles.root} ${placement === 'center' ? styles.rootCenter : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className={`${styles.backdrop} ${visible ? styles.open : styles.closing}`}
        aria-label="Cerrar diálogo"
        onClick={onClose}
      />
      <div
        className={`${styles.dialog} ${size === 'lg' ? styles.dialogLg : ''} ${
          hideTitle ? styles.dialogNoHeader : ''
        } ${placement === 'center' ? styles.dialogCenter : ''} ${
          visible ? styles.open : styles.closing
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={hideTitle ? title : undefined}
        aria-labelledby={hideTitle ? undefined : titleId}
        aria-describedby={description && !hideTitle ? descriptionId : undefined}
        onAnimationEnd={handleDialogAnimationEnd}
      >
        {hideTitle ? null : (
          <header className={styles.header}>
            <div className={styles.heading}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              ) : null}
              {headerAside ? <div className={styles.headerAside}>{headerAside}</div> : null}
            </div>
            <IconButton label="Cerrar" variant="plain" onClick={onClose}>
              <IconClose size={18} />
            </IconButton>
          </header>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
