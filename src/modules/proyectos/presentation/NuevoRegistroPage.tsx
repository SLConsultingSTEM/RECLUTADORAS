import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { CrearProyectoCard } from '@modules/proyectos/presentation/CrearProyectoCard'
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
  IconInbox,
  IconListChecks,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './HomePage.module.css'

type ReclutarView = 'info' | 'registrar'

function parseView(value: string | null): ReclutarView {
  if (value === 'registrar') return 'registrar'
  return 'info'
}

export function NuevoRegistroPage() {
  const { user } = useAuth()
  const canEditInfo = Boolean(user && isCoordinadora(user.role))
  const [searchParams, setSearchParams] = useSearchParams()
  const view = parseView(searchParams.get('vista'))
  const preferredProyectoId = searchParams.get('proyecto') ?? undefined
  const {
    proyectos,
    selected,
    selectedId,
    setSelectedId,
    loading,
    error,
    updateSelected,
    createProyecto,
  } = useProyectos(preferredProyectoId)

  function syncParams(patch: { vista?: ReclutarView; proyecto?: string }) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const before = next.toString()
        if (patch.proyecto) next.set('proyecto', patch.proyecto)
        if (patch.vista !== undefined) {
          if (patch.vista === 'info') next.delete('vista')
          else next.set('vista', patch.vista)
        }
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

  const tabItems = [
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

      {canEditInfo ? (
        <CrearProyectoCard
          proyectos={proyectos}
          onCreate={async (input) => {
            const created = await createProyecto(input)
            syncParams({ proyecto: created.id, vista: 'info' })
          }}
        />
      ) : null}

      {showEmpty ? (
        <EmptyState
          icon={<IconInbox size={22} />}
          title="Sin proyectos activos"
          description={
            canEditInfo
              ? 'Crea el primer proyecto para empezar a gestionar pieza e indicaciones.'
              : 'No hay estudios disponibles para registrar participantes.'
          }
          action={
            canEditInfo ? undefined : (
              <Link to="/panel" className={styles.inlineLink}>
                Volver al panel
              </Link>
            )
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
                <>
                  <span className={styles.selectorLabel}>Filtro por proyecto:</span>
                  <div className={styles.selectorControl}>
                    <Select
                      variant="pills"
                      label="Filtro por proyecto"
                      name="proyecto"
                      value={selectedId}
                      icon={<IconFolder size={16} />}
                      onChange={(e) => {
                        const nextId = e.target.value
                        setSelectedId(nextId)
                        syncParams({ proyecto: nextId, vista: 'info' })
                      }}
                      options={proyectos.map((item) => ({
                        value: item.id,
                        label: item.nombre,
                      }))}
                    />
                  </div>
                </>
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
              ) : canEditInfo ? (
                <ProyectoInfoEditor
                  key={`info-edit-${selected.id}`}
                  proyecto={selected}
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
