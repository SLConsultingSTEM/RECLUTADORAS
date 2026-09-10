import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@shared/ui/Button'
import { IconClose } from '@shared/ui/icons'
import styles from './Modal.module.css'

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
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className={styles.root} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cerrar diálogo"
        onClick={onClose}
      />
      <div
        className={`${styles.dialog} ${size === 'lg' ? styles.dialogLg : ''} ${
          hideTitle ? styles.dialogNoHeader : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={hideTitle ? title : undefined}
        aria-labelledby={hideTitle ? undefined : titleId}
        aria-describedby={description && !hideTitle ? descriptionId : undefined}
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
