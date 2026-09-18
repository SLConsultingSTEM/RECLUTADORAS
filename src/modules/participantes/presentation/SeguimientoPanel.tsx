import { useEffect, useMemo, useRef, useState } from 'react'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import {
  invalidateParticipanteListCache,
  listParticipantesCached,
} from '@modules/participantes/infrastructure/participanteListCache'
import type { EstadoParticipante, Participante } from '@modules/participantes/domain/types'
import { ParticipanteDetalleModal } from '@modules/participantes/presentation/ParticipanteDetalleModal'
import { Alert } from '@shared/ui/Alert'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { LoadingRow } from '@shared/ui/Skeleton'
import { Table } from '@shared/ui/Table'
import {
  IconCheckCircle,
  IconClock,
  IconEye,
  IconFilter,
  IconInbox,
  IconPhoneMissed,
  IconRefresh,
  IconXCircle,
} from '@shared/ui/icons'
import styles from './SeguimientoPanel.module.css'

const participanteRepository = createParticipanteRepository()

const REFRESH_MESSAGES = [
  'Trayendo datos frescos…',
  'Actualizando el listado…',
  'Cargando información…',
  'Sincronizando participantes…',
  'Preparando la tabla…',
] as const

function pickRefreshMessage() {
  const index = Math.floor(Math.random() * REFRESH_MESSAGES.length)
  return REFRESH_MESSAGES[index] ?? REFRESH_MESSAGES[0]
}

interface SeguimientoPanelProps {
  proyectoId: string
  /** Filtro de la coordinadora; vacío = todas. */
  reclutadora?: string
  refreshKey: number
  listTick: number
  estado: string
  campoLabels?: Record<string, string>
  onLoadingChange?: (loading: boolean) => void
}

interface SeguimientoEstadoFilterProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

interface SeguimientoRefreshButtonProps {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'EN_FILTRO', label: 'En filtro' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'NO_CONTESTA', label: 'No contesta' },
  { value: 'P_PACIENTE_FALLECIDO', label: 'Paciente fallecido' },
]

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

function estadoLabel(estado: string) {
  return ESTADOS.find((item) => item.value === estado)?.label ?? estado
}

export function SeguimientoEstadoFilter({
  value,
  onChange,
  disabled = false,
}: SeguimientoEstadoFilterProps) {
  return (
    <div className={styles.filter}>
      <Select
        variant="pills"
        showLabel
        label="Filtrar por estado:"
        name="estado"
        value={value}
        icon={<IconFilter size={16} />}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        options={ESTADOS}
      />
    </div>
  )
}

export function SeguimientoRefreshButton({
  loading = false,
  disabled = false,
  onClick,
}: SeguimientoRefreshButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.refreshBtn} ${loading ? styles.refreshBtnLoading : ''}`}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
    >
      <IconRefresh
        size={16}
        className={`${styles.refreshIcon} ${loading ? styles.refreshIconSpinning : ''}`}
        aria-hidden
      />
      <span className={styles.refreshLabel}>
        {loading ? 'Actualizando…' : 'Actualizar'}
      </span>
    </button>
  )
}

export function SeguimientoPanel({
  proyectoId,
  reclutadora = '',
  refreshKey,
  listTick,
  estado,
  campoLabels = {},
  onLoadingChange,
}: SeguimientoPanelProps) {
  const [items, setItems] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [contentKey, setContentKey] = useState(0)
  const [refreshMessage, setRefreshMessage] = useState<string>(REFRESH_MESSAGES[0])
  const [selected, setSelected] = useState<Participante | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set())
  const hasLoadedRef = useRef(false)
  const listWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    hasLoadedRef.current = false
    setHasLoaded(false)
    setItems([])
    setLoading(true)
    setDetailOpen(false)
    setSelected(null)
  }, [proyectoId])

  useEffect(() => {
    let active = true

    async function load() {
      const softRefresh = hasLoadedRef.current
      const startedAt = Date.now()
      if (softRefresh) setRefreshMessage(pickRefreshMessage())
      setLoading(true)
      onLoadingChange?.(true)
      setError('')

      try {
        const force = softRefresh
        if (force) invalidateParticipanteListCache(proyectoId, reclutadora)

        const data = await listParticipantesCached(participanteRepository, proyectoId, {
          reclutadora,
          force,
        })

        if (!active) return
        setItems(data)
        setContentKey((value) => value + 1)
        hasLoadedRef.current = true
        setHasLoaded(true)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Error al cargar seguimiento')
        }
      } finally {
        if (active) {
          // Soft refresh: mantener el estado visible un mínimo para que se note
          if (softRefresh) {
            const elapsed = Date.now() - startedAt
            const minVisibleMs = 900
            if (elapsed < minVisibleMs) {
              await new Promise((resolve) => {
                window.setTimeout(resolve, minVisibleMs - elapsed)
              })
            }
          }
          if (!active) return
          setLoading(false)
          onLoadingChange?.(false)
        }
      }
    }

    void load()
    return () => {
      active = false
      onLoadingChange?.(false)
    }
  }, [proyectoId, reclutadora, refreshKey, listTick, onLoadingChange])

  const visibleItems = useMemo(() => {
    if (!estado) return items
    return items.filter((item) => item.estado === estado)
  }, [items, estado])

  const showInitialLoader = loading && !hasLoaded
  const isRefreshing = loading && hasLoaded
  const tableHeaders = ['Nombre', 'Documento', 'Ciudad', 'Teléfono', 'Estado', 'Acción']

  useEffect(() => {
    setRevealedIds(new Set())
  }, [contentKey, estado])

  useEffect(() => {
    if (showInitialLoader || isRefreshing) return

    const root = listWrapRef.current
    if (!root) return

    const rows = root.querySelectorAll<HTMLElement>('[data-reveal-id]')
    if (rows.length === 0) return

    const mobileQuery = window.matchMedia('(max-width: 1024px)')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Desktop / reduced motion: mostrar todo de una
    if (!mobileQuery.matches || prefersReduced) {
      setRevealedIds(new Set(visibleItems.map((item) => item.id)))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const row = entry.target as HTMLElement
          const id = row.dataset.revealId
          if (!id) continue
          setRevealedIds((prev) => {
            if (prev.has(id)) return prev
            const next = new Set(prev)
            next.add(id)
            return next
          })
          observer.unobserve(row)
        }
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: '48px 0px -4% 0px',
      },
    )

    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [contentKey, showInitialLoader, isRefreshing, visibleItems])

  function openDetalle(item: Participante) {
    setSelected(item)
    setDetailOpen(true)
  }

  function closeDetalle() {
    setDetailOpen(false)
  }

  return (
    <section className={styles.section}>
      {error ? <Alert tone="error">{error}</Alert> : null}

      {showInitialLoader ? <LoadingRow label="Cargando seguimiento…" /> : null}

      {!showInitialLoader ? (
        <div className={styles.contentSwap} aria-busy={isRefreshing}>
          {isRefreshing || visibleItems.length > 0 ? (
            <div ref={listWrapRef} className={`${styles.contentPane} ${styles.tableWrap}`}>
              <Table headers={tableHeaders}>
                {isRefreshing ? (
                  <tr className={styles.loadingRow}>
                    <td colSpan={tableHeaders.length}>
                      <div className={styles.refreshBanner} role="status" aria-live="polite">
                        <span className={styles.refreshBannerPulse} aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                        <div className={styles.refreshBannerCopy}>
                          <strong className={styles.refreshBannerTitle}>{refreshMessage}</strong>
                          <span className={styles.refreshBannerHint}>
                            Un momento, estamos sincronizando…
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((item) => (
                    <tr
                      key={`${contentKey}-${item.id}`}
                      data-reveal-id={item.id}
                      className={`${styles.dataRow} ${styles.rowReveal} ${
                        revealedIds.has(item.id) ? styles.rowRevealVisible : ''
                      }`}
                    >
                      <td data-label="Nombre">
                        <span className={styles.name}>{item.nombre}</span>
                      </td>
                      <td data-label="Documento">
                        {item.tipoDocumento
                          ? `${item.tipoDocumento} ${item.documento}`
                          : item.documento}
                      </td>
                      <td data-label="Ciudad">{item.ciudad}</td>
                      <td data-label="Teléfono">{item.telefono}</td>
                      <td data-label="Estado">
                        <Badge tone={estadoTone(item.estado)} icon={estadoIcon(item.estado)}>
                          {estadoLabel(item.estado)}
                        </Badge>
                      </td>
                      <td data-label="Acción">
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openDetalle(item)}
                        >
                          <IconEye size={15} aria-hidden />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </Table>
            </div>
          ) : (
            <div key={`empty-${contentKey}`} className={styles.contentPane}>
              <EmptyState
                icon={<IconInbox size={20} />}
                title="Sin participantes"
                description="No hay registros para el filtro seleccionado."
              />
            </div>
          )}
        </div>
      ) : null}

      <ParticipanteDetalleModal
        open={detailOpen}
        participante={selected}
        onClose={closeDetalle}
        campoLabels={campoLabels}
      />
    </section>
  )
}
