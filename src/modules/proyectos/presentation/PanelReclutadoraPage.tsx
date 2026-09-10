import { useState } from 'react'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { SeguimientoPanel } from '@modules/participantes/presentation/SeguimientoPanel'
import { useSeguimientoResumen } from '@modules/participantes/presentation/useSeguimientoResumen'
import { Alert } from '@shared/ui/Alert'
import { Card } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { SkeletonBlock } from '@shared/ui/Skeleton'
import { SoftSwap } from '@shared/ui/SoftSwap'
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

  const showEmpty = !loading && proyectos.length === 0 && !error
  const showShell = loading || proyectos.length > 0
  const shellReady = !loading && Boolean(selected)
  const statsReady = shellReady && !resumenLoading

  return (
    <div className={styles.page}>
      {error ? <Alert tone="error" title="No se pudo cargar">{error}</Alert> : null}

      {showEmpty ? (
        <EmptyState
          icon={<IconInbox size={22} />}
          title="Sin proyectos activos"
          description="Cuando haya estudios disponibles aparecerán aquí."
        />
      ) : null}

      {showShell ? (
        <Card className={styles.workspaceCard}>
          <div className={`${styles.workspaceSwitch} ${styles.workspaceSwitchSplit}`}>
            <div className={styles.workspaceHeading}>
              <p className={styles.workspaceHeadingLead}>Seguimiento</p>
              <h2 className={styles.workspaceHeadingName}>Panel de reclutamientos</h2>
            </div>

            <div className={styles.workspaceSelector}>
              {shellReady ? (
                <Select
                  variant="pills"
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
              ) : (
                <SkeletonBlock height={48} />
              )}
            </div>
          </div>

          {resumenError ? (
            <Alert tone="error" title="No se pudo cargar el resumen">
              {resumenError}
            </Alert>
          ) : null}

          <SoftSwap
            loading={!statsReady}
            skeleton={
              <section className={styles.stats} aria-hidden>
                <SkeletonBlock height={104} />
                <SkeletonBlock height={104} />
                <SkeletonBlock height={104} />
                <SkeletonBlock height={104} />
                <SkeletonBlock height={104} />
              </section>
            }
          >
            <section className={styles.stats} aria-label="Conteos de reclutamiento">
              <StatCard
                label="Total"
                value={resumen.total}
                detail={selected?.nombre}
                icon={<IconUsers size={16} />}
                tone="primary"
              />
              <StatCard
                label="En filtro"
                value={resumen.enFiltro}
                detail="Pendientes de gestión"
                icon={<IconClock size={16} />}
                tone="warning"
              />
              <StatCard
                label="Aprobados"
                value={resumen.aprobados}
                detail="Avance positivo"
                icon={<IconCheckCircle size={16} />}
                tone="success"
              />
              <StatCard
                label="Rechazados"
                value={resumen.rechazados}
                detail="No continúan"
                icon={<IconXCircle size={16} />}
                tone="accent"
              />
              <StatCard
                label="No contesta"
                value={resumen.noContesta}
                detail="Sin respuesta"
                icon={<IconPhoneMissed size={16} />}
                tone="info"
              />
            </section>
          </SoftSwap>

          <section className={styles.panelSection}>
            <header className={styles.panelSectionHead}>
              <div className={styles.panelSectionTitleWrap}>
                <span className={styles.panelSectionIcon} aria-hidden>
                  <IconUsers size={18} />
                </span>
                <div>
                  <span className={styles.panelSectionEyebrow}>Participantes</span>
                  <h3 className={styles.panelSectionTitle}>Listado de seguimiento</h3>
                </div>
              </div>
            </header>

            <SoftSwap loading={!shellReady} skeleton={<SkeletonBlock height={220} />}>
              {selected ? (
                <SeguimientoPanel proyectoId={selected.id} refreshKey={refreshKey} />
              ) : null}
            </SoftSwap>
          </section>
        </Card>
      ) : null}
    </div>
  )
}
