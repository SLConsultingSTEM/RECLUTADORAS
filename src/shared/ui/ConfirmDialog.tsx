import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Button, IconButton } from '@shared/ui/Button'
import { Modal } from '@shared/ui/Modal'
import { IconAlertCircle, IconClose } from '@shared/ui/icons'
import styles from './ConfirmDialog.module.css'

const CLOSE_HOLD_MS = 360

export type ConfirmOptions = {
  title: string
  /** Texto claro de la acción. El nombre va en `subject` (negrita). */
  message?: string
  /** Nombre de lo que se elimina; se muestra en negrita. */
  subject?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

type ConfirmDialogProps = ConfirmOptions & {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  subject,
  confirmLabel = 'Sí, eliminar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} hideTitle size="md" placement="center">
      <div className={styles.panel} data-tone={tone}>
        <IconButton
          label="Cerrar"
          variant="plain"
          className={styles.closeBtn}
          disabled={busy}
          onClick={onCancel}
        >
          <IconClose size={18} />
        </IconButton>

        <div
          className={`${styles.iconWrap} ${tone === 'danger' ? styles.iconDanger : styles.iconPrimary}`}
        >
          <IconAlertCircle size={28} />
        </div>

        <h2 className={styles.title}>{title}</h2>

        <div className={styles.copy}>
          {message ? <p className={styles.message}>{message}</p> : null}
          {subject ? <p className={styles.subject}>{subject}</p> : null}
          <p className={styles.hint}>Esta acción no se puede deshacer.</p>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            disabled={busy}
            loading={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ConfirmOptions | null>(null)
  const pendingRef = useRef<PendingConfirm | null>(null)
  const holdTimerRef = useRef<number | null>(null)

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        clearHoldTimer()
        pendingRef.current = { ...options, resolve }
        setView(options)
        setOpen(true)
      })
    },
    [clearHoldTimer],
  )

  const close = useCallback(
    (value: boolean) => {
      const current = pendingRef.current
      pendingRef.current = null
      current?.resolve(value)
      setOpen(false)
      clearHoldTimer()
      // Conserva título/asunto hasta que termine la animación de cierre.
      holdTimerRef.current = window.setTimeout(() => {
        setView(null)
        holdTimerRef.current = null
      }, CLOSE_HOLD_MS)
    },
    [clearHoldTimer],
  )

  const dialog: ReactNode = (
    <ConfirmDialog
      open={open}
      title={view?.title ?? ''}
      message={view?.message}
      subject={view?.subject}
      confirmLabel={view?.confirmLabel}
      cancelLabel={view?.cancelLabel}
      tone={view?.tone}
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
    />
  )

  return { confirm, dialog }
}
