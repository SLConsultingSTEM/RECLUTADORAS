import { useEffect, useState } from 'react'
import { listParticipantesUseCase } from '@modules/participantes/application/participanteUseCases'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import type { EstadoParticipante, Participante } from '@modules/participantes/domain/types'
import { Alert } from '@shared/ui/Alert'
import { Badge } from '@shared/ui/Badge'
import { Button } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { LoadingRow } from '@shared/ui/Skeleton'
import { Table } from '@shared/ui/Table'
import {
  IconCheckCircle,
  IconClock,
  IconFilter,
  IconInbox,
  IconPhoneMissed,
  IconRefresh,
  IconXCircle,
} from '@shared/ui/icons'
import styles from './SeguimientoPanel.module.css'

const participanteRepository = createParticipanteRepository()

interface SeguimientoPanelProps {
  proyectoId: string
  refreshKey: number
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

export function SeguimientoPanel({ proyectoId, refreshKey }: SeguimientoPanelProps) {
  const [estado, setEstado] = useState('')
  const [listTick, setListTick] = useState(0)
  const [items, setItems] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await listParticipantesUseCase(participanteRepository, {
          proyectoId,
          estado: estado || undefined,
        })
        if (active) setItems(data)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Error al cargar seguimiento')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [proyectoId, estado, refreshKey, listTick])

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <div className={styles.filter}>
          <Select
            variant="pills"
            showLabel
            label="Filtrar por estado:"
            name="estado"
            value={estado}
            icon={<IconFilter size={16} />}
            onChange={(e) => setEstado(e.target.value)}
            options={ESTADOS}
          />
        </div>

        <Button
          type="button"
          variant="soft"
          size="md"
          className={styles.refreshBtn}
          icon={
            <IconRefresh
              size={16}
              className={loading ? styles.refreshIconSpinning : styles.refreshIcon}
            />
          }
          disabled={loading}
          onClick={() => setListTick((value) => value + 1)}
        >
          Actualizar
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {loading ? <LoadingRow label="Cargando seguimiento…" /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          icon={<IconInbox size={20} />}
          title="Sin participantes"
          description="No hay registros para el filtro seleccionado."
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className={styles.tableWrap}>
          <Table headers={['Nombre', 'Documento', 'Ciudad', 'Teléfono', 'Estado', 'Creado por']}>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className={styles.name}>{item.nombre}</span>
                </td>
                <td>
                  {item.tipoDocumento ? `${item.tipoDocumento} ${item.documento}` : item.documento}
                </td>
                <td>{item.ciudad}</td>
                <td>{item.telefono}</td>
                <td>
                  <Badge tone={estadoTone(item.estado)} icon={estadoIcon(item.estado)}>
                    {estadoLabel(item.estado)}
                  </Badge>
                </td>
                <td>{item.creadoPor}</td>
              </tr>
            ))}
          </Table>
        </div>
      ) : null}
    </section>
  )
}
