import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { ProyectoInfo } from '@modules/proyectos/presentation/ProyectoInfo'
import { ProyectoForm } from '@modules/proyectos/presentation/ProyectoForm'
import { Alert } from '@shared/ui/Alert'
import { Card } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { SkeletonBlock } from '@shared/ui/Skeleton'
import { SoftSwap } from '@shared/ui/SoftSwap'
import { Tabs } from '@shared/ui/Tabs'
import { IconFolder, IconImage, IconInbox, IconUserPlus } from '@shared/ui/icons'
import styles from './HomePage.module.css'

type ReclutarView = 'info' | 'registrar'

function parseView(value: string | null): ReclutarView {
  return value === 'registrar' ? 'registrar' : 'info'
}

export function NuevoRegistroPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = parseView(searchParams.get('vista'))
  const preferredProyectoId = searchParams.get('proyecto') ?? undefined
  const { proyectos, selected, selectedId, setSelectedId, loading, error } =
    useProyectos(preferredProyectoId)

  function syncParams(patch: { vista?: ReclutarView; proyecto?: string }) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const before = next.toString()
        if (patch.proyecto) next.set('proyecto', patch.proyecto)
        if (patch.vista === 'registrar') next.set('vista', 'registrar')
        if (patch.vista === 'info') next.delete('vista')
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
              items={[
                {
                  id: 'info',
                  label: 'Información',
                  icon: <IconImage size={16} />,
                },
                {
                  id: 'registrar',
                  label: 'Registrar',
                  icon: <IconUserPlus size={16} />,
                },
              ]}
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
                    syncParams({ proyecto: nextId, vista: 'info' })
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
              view === 'info' ? (
                <ProyectoInfo
                  key={`info-${selected.id}`}
                  nombre={selected.nombre}
                  descripcionHtml={selected.descripcionHtml}
                  imagenUrl={selected.imagenUrl}
                  imagenNombre={selected.imagenNombre}
                  mediaOnly
                />
              ) : (
                <ProyectoForm
                  key={`form-${selected.id}`}
                  proyecto={selected}
                  onRegistered={() => undefined}
                />
              )
            ) : null}
          </SoftSwap>
        </Card>
      ) : null}
    </div>
  )
}
