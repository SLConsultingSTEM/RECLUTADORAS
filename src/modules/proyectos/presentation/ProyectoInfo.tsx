import { sanitizeHtml } from '@shared/security/sanitize'
import { Badge } from '@shared/ui/Badge'
import { IconDownload, IconImage, IconListChecks, IconMapPin } from '@shared/ui/icons'
import styles from './ProyectoInfo.module.css'

interface ProyectoInfoProps {
  nombre: string
  descripcionHtml: string
  imagenUrl: string
  imagenNombre: string
  ciudades?: string[]
  camposCount?: number
  compact?: boolean
}

export function ProyectoInfo({
  nombre,
  descripcionHtml,
  imagenUrl,
  imagenNombre,
  ciudades = [],
  camposCount = 0,
  compact = false,
}: ProyectoInfoProps) {
  return (
    <article className={`${styles.article} ${compact ? styles.compact : ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{nombre}</h2>
        <div className={styles.meta}>
          <Badge tone="primary" icon={<IconMapPin size={13} />}>
            {ciudades.length || 0} ciudades
          </Badge>
          <Badge tone="accent" icon={<IconListChecks size={13} />}>
            {camposCount} campos
          </Badge>
        </div>
      </header>

      {imagenUrl ? (
        <section className={styles.media}>
          <div className={styles.mediaTop}>
            <span className={styles.mediaLabel}>
              <IconImage size={15} />
              Pieza gráfica
            </span>
            <a className={styles.download} href={imagenUrl} download={imagenNombre}>
              <IconDownload size={15} />
              Descargar
            </a>
          </div>
          <img src={imagenUrl} alt={`Pieza gráfica de ${nombre}`} className={styles.image} />
        </section>
      ) : null}

      <section className={styles.contentBlock}>
        <h3 className={styles.contentTitle}>Condiciones</h3>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(descripcionHtml) }}
        />
      </section>
    </article>
  )
}
