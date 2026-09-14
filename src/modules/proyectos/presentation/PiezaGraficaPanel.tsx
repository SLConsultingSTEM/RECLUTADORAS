import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState'
import { safeMediaUrl } from '@shared/security/url'
import {
  IconClose,
  IconDownload,
  IconEye,
  IconImage,
  IconMaximize,
  IconPlus,
  IconTrash,
} from '@shared/ui/icons'
import styles from './ProyectoInfo.module.css'

export type PiezaGraficaValue = {
  imagenUrl: string
  imagenNombre: string
}

interface PiezaGraficaPanelProps {
  nombre: string
  imagenUrl: string
  imagenNombre: string
  /** Coordinadora: reemplazar o quitar la imagen */
  editable?: boolean
  /** Franja compacta para el editor de Información */
  compact?: boolean
  disabled?: boolean
  onChange?: (value: PiezaGraficaValue) => void
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

function sanitizeDownloadName(name: string): string {
  const withoutControls = Array.from(name)
    .filter((ch) => {
      const code = ch.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
  const base = withoutControls.replace(/[\\/:*?"<>|]/g, '_').trim()
  return base.slice(0, 120) || 'pieza-grafica.png'
}

function PiezaLightbox({
  open,
  nombre,
  imagenUrl,
  onClose,
}: {
  open: boolean
  nombre: string
  imagenUrl: string
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open && imagenUrl) {
      setMounted(true)
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
  }, [open, imagenUrl])

  useEffect(() => {
    if (!mounted) return

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
  }, [mounted, onClose])

  if (!mounted || !imagenUrl) return null

  return createPortal(
    <div
      className={`${styles.lightbox} ${visible ? styles.lightboxOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Pieza gráfica de ${nombre}`}
      onClick={onClose}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (!open && !visible) setMounted(false)
      }}
    >
      <button
        type="button"
        className={styles.lightboxClose}
        aria-label="Cerrar"
        onClick={onClose}
      >
        <IconClose size={18} />
      </button>
      <img
        src={imagenUrl}
        alt={`Pieza gráfica ampliada de ${nombre}`}
        className={styles.lightboxImage}
        width={1200}
        height={1200}
        decoding="async"
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  )
}

export function PiezaGraficaPanel({
  nombre,
  imagenUrl,
  imagenNombre,
  editable = false,
  compact = false,
  disabled = false,
  onChange,
}: PiezaGraficaPanelProps) {
  const [abierta, setAbierta] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaUrl = safeMediaUrl(imagenUrl)

  async function handleFile(file: File | undefined) {
    if (!file || !onChange) return
    setUploadError('')

    if (!ALLOWED_TYPES.has(file.type)) {
      setUploadError('Formato no permitido. Usa PNG, JPEG, WebP o GIF.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError('La imagen supera el límite de 2 MB.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (!safeMediaUrl(dataUrl)) {
        setUploadError('La imagen no es válida.')
        return
      }
      onChange({
        imagenUrl: dataUrl,
        imagenNombre: sanitizeDownloadName(file.name || 'pieza-grafica.png'),
      })
    } catch {
      setUploadError('No se pudo leer la imagen')
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      hidden
      disabled={disabled}
      onChange={(e) => {
        void handleFile(e.target.files?.[0])
        e.target.value = ''
      }}
    />
  )

  const lightbox = (
    <PiezaLightbox
      open={abierta}
      nombre={nombre}
      imagenUrl={mediaUrl}
      onClose={() => setAbierta(false)}
    />
  )

  if (compact && editable) {
    return (
      <aside className={styles.mediaStrip}>
        {fileInput}
        <div className={styles.mediaStripPreview}>
          {mediaUrl ? (
            <div className={styles.mediaStripThumbWrap}>
              <img
                src={mediaUrl}
                alt={`Pieza gráfica de ${nombre}`}
                className={styles.mediaStripThumb}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <span className={styles.mediaStripPlaceholder} aria-hidden="true">
              <IconImage size={22} />
            </span>
          )}
        </div>

        <div className={styles.mediaStripBody}>
          <span className={styles.mediaLabel}>
            <IconImage size={20} />
            Pieza gráfica
          </span>
          <p className={styles.mediaStripMeta}>
            {uploadError
              ? uploadError
              : mediaUrl
                ? imagenNombre || 'Imagen cargada'
                : 'Sin imagen. Las reclutadoras la usan para descargar.'}
          </p>
          {mediaUrl ? (
            <button
              type="button"
              className={styles.mediaStripView}
              onClick={() => setAbierta(true)}
            >
              <IconEye size={18} />
              Ver imagen
            </button>
          ) : null}
        </div>

        <div className={styles.mediaStripActions}>
          {mediaUrl ? (
            <>
              <Button
                type="button"
                variant="soft"
                icon={<IconPlus size={18} />}
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                Reemplazar
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<IconTrash size={18} />}
                disabled={disabled}
                onClick={() => onChange?.({ imagenUrl: '', imagenNombre: '' })}
              >
                Quitar
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="soft"
              icon={<IconPlus size={18} />}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Agregar imagen
            </Button>
          )}
        </div>

        {lightbox}
      </aside>
    )
  }

  const emptyEditable = editable && !mediaUrl

  if (emptyEditable) {
    return (
      <aside className={styles.mediaFeature}>
        <div className={styles.mediaTop}>
          <span className={styles.mediaLabel}>
            <IconImage size={17} />
            Pieza gráfica
          </span>
        </div>
        <EmptyState
          icon={<IconImage size={22} />}
          title="Sin pieza gráfica"
          description={
            uploadError ||
            'Sube una imagen para que las reclutadoras puedan descargarla.'
          }
          action={
            <>
              {fileInput}
              <Button
                type="button"
                variant="soft"
                icon={<IconPlus size={18} />}
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                Agregar imagen
              </Button>
            </>
          }
        />
      </aside>
    )
  }

  if (!mediaUrl && !editable) {
    return (
      <aside className={styles.mediaFeature}>
        <EmptyState
          icon={<IconImage size={22} />}
          title="Sin pieza gráfica"
          description="Este proyecto aún no tiene imagen para descargar."
        />
      </aside>
    )
  }

  return (
    <aside className={styles.mediaFeature}>
      <div className={styles.mediaTop}>
        <span className={styles.mediaLabel}>
          <IconImage size={17} />
          Pieza gráfica
        </span>

        <div className={styles.mediaActions}>
          {editable ? (
            <>
              {fileInput}
              <Button
                type="button"
                variant="soft"
                icon={<IconPlus size={18} />}
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                Reemplazar
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<IconTrash size={18} />}
                disabled={disabled}
                onClick={() => onChange?.({ imagenUrl: '', imagenNombre: '' })}
              >
                Quitar
              </Button>
            </>
          ) : (
            <a className={styles.download} href={mediaUrl} download={imagenNombre}>
              <span className={styles.downloadIcon}>
                <IconDownload size={16} />
              </span>
              <span className={styles.downloadLabel}>Descargar imagen</span>
            </a>
          )}
        </div>
      </div>

      <div className={styles.mediaStage}>
        <div className={styles.imageFrame}>
          <img
            src={mediaUrl}
            alt={`Pieza gráfica de ${nombre}`}
            className={styles.imageFeature}
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
          {!editable ? (
            <button
              type="button"
              className={styles.expandButton}
              aria-label="Ampliar imagen"
              onClick={() => setAbierta(true)}
            >
              <IconMaximize size={15} />
              <span className={styles.expandLabel}>Ampliar</span>
            </button>
          ) : null}
        </div>
      </div>

      {lightbox}
    </aside>
  )
}
