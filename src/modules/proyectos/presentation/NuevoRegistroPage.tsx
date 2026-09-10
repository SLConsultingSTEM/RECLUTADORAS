import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { ProyectoInfo } from '@modules/proyectos/presentation/ProyectoInfo'
import { ProyectoInfoEditor } from '@modules/proyectos/presentation/ProyectoInfoEditor'
import { ProyectoForm } from '@modules/proyectos/presentation/ProyectoForm'
import { sanitizeHtml } from '@shared/security/sanitize'
import { Alert } from '@shared/ui/Alert'
import { Card } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { SkeletonBlock } from '@shared/ui/Skeleton'
import { SoftSwap } from '@shared/ui/SoftSwap'
import { Tabs } from '@shared/ui/Tabs'
import {
  IconFolder,
  IconImage,
  IconInbox,
  IconListChecks,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './HomePage.module.css'

type ReclutarView = 'pieza' | 'info' | 'registrar'

function parseView(value: string | null, canEditInfo: boolean): ReclutarView {
  if (value === 'registrar') return 'registrar'
  if (value === 'pieza' && canEditInfo) return 'pieza'
  return 'info'
}

export function NuevoRegistroPage() {
  const { user } = useAuth()
  const canEditInfo = Boolean(user && isCoordinadora(user.role))
  const [searchParams, setSearchParams] = useSearchParams()
  const view = parseView(searchParams.get('vista'), canEditInfo)
  const preferredProyectoId = searchParams.get('proyecto') ?? undefined
  const { proyectos, selected, selectedId, setSelectedId, loading, error, updateSelected } =
    useProyectos(preferredProyectoId)

  function syncParams(patch: { vista?: ReclutarView; proyecto?: string }) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const before = next.toString()
        if (patch.proyecto) next.set('proyecto', patch.proyecto)
        if (patch.vista === 'registrar') next.set('vista', 'registrar')
        else if (patch.vista === 'pieza') next.set('vista', 'pieza')
        else if (patch.vista === 'info') next.delete('vista')
        if (next.toString() === before) return prev
        return next
      },
      { replace: true },
    )
  }

  useEffect(() => {
    if (!selectedId) return
    if (searchParams.get('proyecto') === selectedId) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (next.get('proyecto') === selectedId) return prev
        next.set('proyecto', selectedId)
        return next
      },
      { replace: true },
    )
  }, [selectedId, searchParams, setSearchParams])

  const showEmpty = !loading && proyectos.length === 0 && !error
  const showShell = loading || proyectos.length > 0
  const contentReady = !loading && Boolean(selected)
  const defaultVista: ReclutarView = canEditInfo ? 'pieza' : 'info'

  const tabItems = [
    ...(canEditInfo
      ? [
          {
            id: 'pieza',
            label: 'Pieza',
            icon: <IconImage size={16} />,
          },
        ]
      : []),
    {
      id: 'info',
      label: 'Información',
      icon: <IconListChecks size={16} />,
    },
    {
      id: 'registrar',
      label: 'Registrar',
      icon: <IconUserPlus size={16} />,
    },
  ]

  return (
    <div className={styles.page}>
      {error ? <Alert tone="error" title="No se pudo cargar">{error}</Alert> : null}

      {showEmpty ? (
        <EmptyState
          icon={<IconInbox size={22} />}
          title="Sin proyectos activos"
          description="No hay estudios disponibles para registrar participantes."
          action={
            <Link to="/panel" className={styles.inlineLink}>
              Volver al panel
            </Link>
          }
        />
      ) : null}

      {showShell ? (
        <Card className={styles.workspaceCard}>
          <div className={`${styles.workspaceSwitch} ${styles.workspaceSwitchSplit}`}>
            <Tabs
              label="Vista de reclutamiento"
              active={view}
              onChange={(id) => {
                const nextView = id as ReclutarView
                syncParams({
                  vista: nextView,
                  proyecto: selectedId || undefined,
                })
              }}
              items={tabItems}
            />

            <div className={styles.workspaceSelector}>
              {contentReady ? (
                <Select
                  variant="pills"
                  label="Proyecto"
                  name="proyecto"
                  value={selectedId}
                  icon={<IconFolder size={16} />}
                  onChange={(e) => {
                    const nextId = e.target.value
                    setSelectedId(nextId)
                    syncParams({ proyecto: nextId, vista: defaultVista })
                  }}
                  options={proyectos.map((item) => ({
                    value: item.id,
                    label: item.nombre,
                  }))}
                />
              ) : (
                <SkeletonBlock height={48} />
              )}
            </div>
          </div>

          <SoftSwap loading={!contentReady} skeleton={<SkeletonBlock height={320} />}>
            {selected ? (
              view === 'registrar' ? (
                <ProyectoForm
                  key={`form-${selected.id}`}
                  proyecto={selected}
                  onRegistered={() => undefined}
                />
              ) : canEditInfo && (view === 'pieza' || view === 'info') ? (
                <ProyectoInfoEditor
                  key={`info-edit-${selected.id}`}
                  proyecto={selected}
                  section={view === 'pieza' ? 'pieza' : 'indicaciones'}
                  onSave={async (patch) => {
                    await updateSelected({
                      ...patch,
                      descripcionHtml: sanitizeHtml(patch.descripcionHtml),
                    })
                  }}
                />
              ) : (
                <ProyectoInfo
                  key={`info-${selected.id}`}
                  nombre={selected.nombre}
                  descripcionHtml={selected.descripcionHtml}
                  imagenUrl={selected.imagenUrl}
                  imagenNombre={selected.imagenNombre}
                  mediaOnly
                />
              )
            ) : null}
          </SoftSwap>
        </Card>
      ) : null}
    </div>
  )
}
