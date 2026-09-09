import { useState } from 'react'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { ProyectoInfo } from '@modules/proyectos/presentation/ProyectoInfo'
import { SeguimientoPanel } from '@modules/participantes/presentation/SeguimientoPanel'
import { Alert } from '@shared/ui/Alert'
import { Card, CardHeader } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { LoadingRow, SkeletonBlock } from '@shared/ui/Skeleton'
import { StatCard } from '@shared/ui/StatCard'
import { Tabs } from '@shared/ui/Tabs'
import {
  IconFileText,
  IconFolder,
  IconImage,
  IconInbox,
  IconListChecks,
  IconMapPin,
  IconUsers,
} from '@shared/ui/icons'
import styles from './HomePage.module.css'

export function PanelReclutadoraPage() {
  const { proyectos, selected, selectedId, setSelectedId, loading, error } = useProyectos()
  const [refreshKey, setRefreshKey] = useState(0)
  const [tab, setTab] = useState<'info' | 'seguimiento'>('seguimiento')

  return (
    <div className={styles.page}>
      {error ? <Alert tone="error" title="No se pudo cargar">{error}</Alert> : null}

      {loading ? (
        <div className={styles.workspaceStack}>
          <SkeletonBlock height={88} />
          <div className={styles.stats}>
            <SkeletonBlock height={104} />
            <SkeletonBlock height={104} />
            <SkeletonBlock height={104} />
          </div>
          <LoadingRow label="Cargando proyectos…" />
        </div>
      ) : null}

      {!loading && proyectos.length === 0 && !error ? (
        <EmptyState
          icon={<IconInbox size={22} />}
          title="Sin proyectos activos"
          description="Cuando haya estudios disponibles aparecerán aquí."
        />
      ) : null}

      {!loading && proyectos.length > 0 ? (
        <>
          <section className={styles.toolbar}>
            <div className={styles.toolbarCopy}>
              <span className={styles.toolbarLabel}>Proyecto activo</span>
              <h2 className={styles.toolbarTitle}>{selected?.nombre ?? 'Selecciona un proyecto'}</h2>
            </div>

            <div className={styles.toolbarActions}>
              <div className={styles.selector}>
                <Select
                  label="Cambiar proyecto"
                  name="proyecto"
                  value={selectedId}
                  icon={<IconFolder size={16} />}
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    setRefreshKey((value) => value + 1)
                    setTab('seguimiento')
                  }}
                  options={proyectos.map((item) => ({
                    value: item.id,
                    label: item.nombre,
                  }))}
                />
              </div>
            </div>
          </section>

          {selected ? (
            <>
              <section className={styles.stats} aria-label="Resumen">
                <StatCard
                  label="Ciudades"
                  value={selected.ciudadesPermitidas.length}
                  detail={selected.ciudadesPermitidas.join(' · ')}
                  icon={<IconMapPin size={16} />}
                  tone="primary"
                  delay={40}
                />
                <StatCard
                  label="Campos del filtro"
                  value={selected.camposEspecificos.length}
                  detail="Variables del perfil"
                  icon={<IconListChecks size={16} />}
                  tone="accent"
                  delay={90}
                />
                <StatCard
                  label="Pieza gráfica"
                  value={selected.imagenUrl ? 'Lista' : 'Pendiente'}
                  detail={selected.imagenNombre || 'Sin archivo'}
                  icon={<IconImage size={16} />}
                  tone={selected.imagenUrl ? 'success' : 'warning'}
                  delay={140}
                />
              </section>

              <div className={styles.tabsWrap}>
                <Tabs
                  label="Vistas del proyecto"
                  active={tab}
                  onChange={(id) => setTab(id as 'info' | 'seguimiento')}
                  items={[
                    {
                      id: 'seguimiento',
                      label: 'Seguimiento',
                      icon: <IconUsers size={15} />,
                    },
                    {
                      id: 'info',
                      label: 'Información',
                      icon: <IconFileText size={15} />,
                    },
                  ]}
                />
              </div>

              {tab === 'seguimiento' ? (
                <div className={styles.panel} key={`seg-${selected.id}`}>
                  <Card>
                    <CardHeader
                      eyebrow="Participantes"
                      title="Seguimiento"
                      icon={<IconUsers size={18} />}
                    />
                    <SeguimientoPanel proyectoId={selected.id} refreshKey={refreshKey} />
                  </Card>
                </div>
              ) : (
                <div className={styles.panel} key={`info-${selected.id}`}>
                  <Card>
                    <CardHeader
                      eyebrow="Proyecto"
                      title="Condiciones y material"
                      icon={<IconFileText size={18} />}
                    />
                    <ProyectoInfo
                      nombre={selected.nombre}
                      descripcionHtml={selected.descripcionHtml}
                      imagenUrl={selected.imagenUrl}
                      imagenNombre={selected.imagenNombre}
                      ciudades={selected.ciudadesPermitidas}
                      camposCount={selected.camposEspecificos.length}
                    />
                  </Card>
                </div>
              )}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
