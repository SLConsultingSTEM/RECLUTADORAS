import { useState } from 'react'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { SeguimientoPanel } from '@modules/participantes/presentation/SeguimientoPanel'
import { useSeguimientoResumen } from '@modules/participantes/presentation/useSeguimientoResumen'
import { Alert } from '@shared/ui/Alert'
import { Card, CardHeader } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { LoadingRow, SkeletonBlock } from '@shared/ui/Skeleton'
import { StatCard } from '@shared/ui/StatCard'
import {
  IconCheckCircle,
  IconClock,
  IconFolder,
  IconInbox,
  IconPhoneMissed,
  IconUsers,
  IconXCircle,
} from '@shared/ui/icons'
import styles from './HomePage.module.css'

export function PanelReclutadoraPage() {
  const { proyectos, selected, selectedId, setSelectedId, loading, error } = useProyectos()
  const [refreshKey, setRefreshKey] = useState(0)
  const { resumen, loading: resumenLoading, error: resumenError } = useSeguimientoResumen(
    selectedId,
    refreshKey,
  )

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
            <SkeletonBlock height={104} />
          </div>
          <LoadingRow label="Cargando panel…" />
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
              <span className={styles.toolbarLabel}>Seguimiento</span>
              <h2 className={styles.toolbarTitle}>Panel de reclutamientos</h2>
            </div>

            <div className={styles.toolbarActions}>
              <div className={styles.selector}>
                <Select
                  label="Proyecto"
                  name="proyecto"
                  value={selectedId}
                  icon={<IconFolder size={16} />}
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    setRefreshKey((value) => value + 1)
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
              {resumenError ? (
                <Alert tone="error" title="No se pudo cargar el resumen">
                  {resumenError}
                </Alert>
              ) : null}

              <section className={styles.stats} aria-label="Conteos de reclutamiento">
                <StatCard
                  label="Total"
                  value={resumenLoading ? '…' : resumen.total}
                  detail={selected.nombre}
                  icon={<IconUsers size={16} />}
                  tone="primary"
                  delay={40}
                />
                <StatCard
                  label="En filtro"
                  value={resumenLoading ? '…' : resumen.enFiltro}
                  detail="Pendientes de gestión"
                  icon={<IconClock size={16} />}
                  tone="warning"
                  delay={80}
                />
                <StatCard
                  label="Aprobados"
                  value={resumenLoading ? '…' : resumen.aprobados}
                  detail="Avance positivo"
                  icon={<IconCheckCircle size={16} />}
                  tone="success"
                  delay={120}
                />
                <StatCard
                  label="Rechazados"
                  value={resumenLoading ? '…' : resumen.rechazados}
                  detail="No continúan"
                  icon={<IconXCircle size={16} />}
                  tone="accent"
                  delay={160}
                />
                <StatCard
                  label="No contesta"
                  value={resumenLoading ? '…' : resumen.noContesta}
                  detail="Sin respuesta"
                  icon={<IconPhoneMissed size={16} />}
                  tone="info"
                  delay={200}
                />
              </section>

              <div className={styles.panel} key={`seg-${selected.id}`}>
                <Card>
                  <CardHeader
                    eyebrow="Participantes"
                    title="Listado de seguimiento"
                    icon={<IconUsers size={18} />}
                  />
                  <SeguimientoPanel proyectoId={selected.id} refreshKey={refreshKey} />
                </Card>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
