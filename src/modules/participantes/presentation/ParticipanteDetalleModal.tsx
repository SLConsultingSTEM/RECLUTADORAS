import type { EstadoParticipante, Participante } from '@modules/participantes/domain/types'
import { Badge } from '@shared/ui/Badge'
import { Modal } from '@shared/ui/Modal'
import {
  IconCheckCircle,
  IconClock,
  IconClose,
  IconFilter,
  IconMapPin,
  IconMessageSquare,
  IconPhoneMissed,
  IconUser,
  IconXCircle,
} from '@shared/ui/icons'
import styles from './ParticipanteDetalleModal.module.css'

const ESTADO_LABELS: Record<string, string> = {
  EN_FILTRO: 'En filtro',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  NO_CONTESTA: 'No contesta',
  P_PACIENTE_FALLECIDO: 'Paciente fallecido',
}

function estadoTone(estado: EstadoParticipante) {
  switch (estado) {
    case 'APROBADO':
      return 'success' as const
    case 'RECHAZADO':
      return 'danger' as const
    case 'EN_FILTRO':
      return 'warning' as const
    case 'NO_CONTESTA':
      return 'info' as const
    default:
      return 'neutral' as const
  }
}

function estadoIcon(estado: EstadoParticipante) {
  switch (estado) {
    case 'APROBADO':
      return <IconCheckCircle size={13} />
    case 'RECHAZADO':
      return <IconXCircle size={13} />
    case 'NO_CONTESTA':
      return <IconPhoneMissed size={13} />
    default:
      return <IconClock size={13} />
  }
}

function formatCampoLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatFecha(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '·'
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

interface ParticipanteDetalleModalProps {
  participante: Participante | null
  open: boolean
  onClose: () => void
  campoLabels?: Record<string, string>
}

export function ParticipanteDetalleModal({
  participante,
  open,
  onClose,
  campoLabels = {},
}: ParticipanteDetalleModalProps) {
  if (!participante) return null

  const extras = Object.entries(participante.camposExtra ?? {}).filter(
    ([, value]) => String(value ?? '').trim().length > 0,
  )
  const observaciones = participante.observaciones?.trim() ?? ''
  const conclusiones = participante.conclusiones ?? []

  const documento = participante.tipoDocumento
    ? `${participante.tipoDocumento} ${participante.documento}`
    : participante.documento

  return (
    <Modal open={open} onClose={onClose} size="lg" title={participante.nombre} hideTitle>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <button
            type="button"
            className={styles.heroClose}
            aria-label="Cerrar"
            title="Cerrar"
            onClick={onClose}
          >
            <IconClose size={16} />
          </button>
          <div className={styles.avatar} aria-hidden>
            {getInitials(participante.nombre)}
          </div>
          <div className={styles.heroCopy}>
            <h3 className={styles.heroName}>{participante.nombre}</h3>
            <div className={styles.heroMeta}>
              <Badge tone={estadoTone(participante.estado)} icon={estadoIcon(participante.estado)}>
                {ESTADO_LABELS[participante.estado] ?? participante.estado}
              </Badge>
              <span className={styles.heroChip}>
                <IconMapPin size={13} aria-hidden />
                {participante.ciudad}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.layout}>
          <section className={`${styles.panel} ${styles.panelBase}`}>
            <div className={styles.panelHead}>
              <span className={styles.panelIcon} aria-hidden>
                <IconUser size={16} />
              </span>
              <h4 className={styles.panelTitle}>Datos base</h4>
            </div>

            <div className={styles.cards}>
              <article className={styles.card}>
                <div>
                  <p className={styles.cardLabel}>Documento</p>
                  <p className={styles.cardValue}>{documento}</p>
                </div>
              </article>
              <article className={styles.card}>
                <div>
                  <p className={styles.cardLabel}>Género</p>
                  <p className={styles.cardValue}>{participante.genero || '—'}</p>
                </div>
              </article>
              <article className={styles.card}>
                <div>
                  <p className={styles.cardLabel}>Ciudad</p>
                  <p className={styles.cardValue}>{participante.ciudad}</p>
                </div>
              </article>
              <article className={styles.card}>
                <div>
                  <p className={styles.cardLabel}>Teléfono</p>
                  <p className={styles.cardValue}>{participante.telefono}</p>
                </div>
              </article>
              <article className={styles.card}>
                <div>
                  <p className={styles.cardLabel}>Hecho por</p>
                  <p className={styles.cardValue}>{participante.creadoPor}</p>
                </div>
              </article>
              <article className={`${styles.card} ${styles.cardWide}`}>
                <div>
                  <p className={styles.cardLabel}>Registrado</p>
                  <p className={styles.cardValue}>{formatFecha(participante.creadoEn)}</p>
                </div>
              </article>
            </div>
          </section>

          <section className={`${styles.panel} ${styles.panelFiltro}`}>
            <div className={styles.panelHead}>
              <span className={styles.panelIcon} aria-hidden>
                <IconFilter size={16} />
              </span>
              <div>
                <h4 className={styles.panelTitle}>Filtro del estudio</h4>
                <p className={styles.panelHint}>Campos específicos del proyecto</p>
              </div>
            </div>

            {extras.length > 0 ? (
              <div className={styles.filtroList}>
                {extras.map(([key, value]) => (
                  <article key={key} className={styles.filtroItem}>
                    <p className={styles.cardLabel}>
                      {campoLabels[key] ?? formatCampoLabel(key)}
                    </p>
                    <p className={styles.cardValue}>{value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyExtras}>Sin campos adicionales registrados.</p>
            )}
          </section>
        </div>

        <section className={`${styles.panel} ${styles.panelObservaciones}`}>
          <div className={styles.panelHead}>
            <span className={styles.panelIcon} aria-hidden>
              <IconMessageSquare size={16} />
            </span>
            <div>
              <h4 className={styles.panelTitle}>Conclusiones</h4>
              <p className={styles.panelHint}>
                {conclusiones.length > 0
                  ? 'De la más reciente a la más antigua'
                  : 'Gestión del estudio'}
              </p>
            </div>
          </div>

          {conclusiones.length > 0 ? (
            <ol className={styles.conclusionesList}>
              {conclusiones.map((conclusion, index) => (
                <li
                  key={`${conclusion.fecha}-${conclusion.tipologia}-${index}`}
                  className={styles.conclusionItem}
                >
                  <div className={styles.conclusionHead}>
                    <span className={styles.conclusionTipologia}>
                      {conclusion.tipologia || 'Sin tipología'}
                    </span>
                    {conclusion.fecha ? (
                      <span className={styles.conclusionFecha}>{conclusion.fecha}</span>
                    ) : null}
                  </div>
                  {conclusion.motivo ? (
                    <p className={styles.conclusionMotivo}>{conclusion.motivo}</p>
                  ) : null}
                  {conclusion.observacion ? (
                    <p className={styles.conclusionObservacion}>{conclusion.observacion}</p>
                  ) : null}
                  {conclusion.autor ? (
                    <p className={styles.conclusionAutor}>Registró: {conclusion.autor}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyExtras}>Sin conclusiones registradas.</p>
          )}
        </section>

        <section className={`${styles.panel} ${styles.panelObservaciones}`}>
          <div className={styles.panelHead}>
            <span className={styles.panelIcon} aria-hidden>
              <IconMessageSquare size={16} />
            </span>
            <div>
              <h4 className={styles.panelTitle}>Observaciones</h4>
              <p className={styles.panelHint}>Notas del seguimiento</p>
            </div>
          </div>

          {observaciones ? (
            <p className={styles.observacionesText}>{observaciones}</p>
          ) : (
            <p className={styles.emptyExtras}>Sin observaciones registradas.</p>
          )}
        </section>
      </div>
    </Modal>
  )
}
