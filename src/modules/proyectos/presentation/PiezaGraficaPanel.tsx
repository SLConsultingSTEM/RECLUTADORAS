import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconClose, IconDownload, IconImage, IconMaximize } from '@shared/ui/icons'
import styles from './ProyectoInfo.module.css'

interface PiezaGraficaPanelProps {
  nombre: string
  imagenUrl: string
  imagenNombre: string
}

export function PiezaGraficaPanel({
  nombre,
  imagenUrl,
  imagenNombre,
}: PiezaGraficaPanelProps) {
  const [abierta, setAbierta] = useState(false)

  useEffect(() => {
    if (!abierta) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAbierta(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [abierta])

  return (
    <aside className={styles.mediaFeature}>
      <div className={styles.mediaTop}>
        <span className={styles.mediaLabel}>
          <IconImage size={17} />
          Pieza gráfica
        </span>
        <a className={styles.download} href={imagenUrl} download={imagenNombre}>
          <span className={styles.downloadIcon}>
            <IconDownload size={16} />
          </span>
          <span className={styles.downloadLabel}>Descargar imagen</span>
        </a>
      </div>

      <div className={styles.mediaStage}>
        <div className={styles.imageFrame}>
          <img
            src={imagenUrl}
            alt={`Pieza gráfica de ${nombre}`}
            className={styles.imageFeature}
          />
          <button
            type="button"
            className={styles.expandButton}
            aria-label="Ampliar imagen"
            onClick={() => setAbierta(true)}
          >
            <IconMaximize size={15} />
            <span className={styles.expandLabel}>Ampliar</span>
          </button>
        </div>
      </div>

      {abierta
        ? createPortal(
            <div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={`Pieza gráfica de ${nombre}`}
              onClick={() => setAbierta(false)}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                aria-label="Cerrar"
                onClick={() => setAbierta(false)}
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
        : null}
    </aside>
  )
}
