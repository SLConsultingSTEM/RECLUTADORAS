import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState'
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
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
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file || !onChange) return
    const dataUrl = await readFileAsDataUrl(file)
    onChange({
      imagenUrl: dataUrl,
      imagenNombre: file.name || 'pieza-grafica.png',
    })
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
      imagenUrl={imagenUrl}
      onClose={() => setAbierta(false)}
    />
  )

  if (compact && editable) {
    return (
      <aside className={styles.mediaStrip}>
        {fileInput}
        <div className={styles.mediaStripPreview}>
          {imagenUrl ? (
            <div className={styles.mediaStripThumbWrap}>
              <img
                src={imagenUrl}
                alt={`Pieza gráfica de ${nombre}`}
                className={styles.mediaStripThumb}
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
            {imagenUrl
              ? imagenNombre || 'Imagen cargada'
              : 'Sin imagen. Las reclutadoras la usan para descargar.'}
          </p>
          {imagenUrl ? (
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
          {imagenUrl ? (
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

  const emptyEditable = editable && !imagenUrl

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
          description="Sube una imagen para que las reclutadoras puedan descargarla."
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

  if (!imagenUrl && !editable) {
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
            <a className={styles.download} href={imagenUrl} download={imagenNombre}>
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
            src={imagenUrl}
            alt={`Pieza gráfica de ${nombre}`}
            className={styles.imageFeature}
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
