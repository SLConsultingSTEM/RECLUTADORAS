import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { listReclutadorasUseCase } from '@modules/participantes/application/participanteUseCases'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import {
  SeguimientoEstadoFilter,
  SeguimientoPanel,
  SeguimientoRefreshButton,
} from '@modules/participantes/presentation/SeguimientoPanel'
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
  const { user } = useAuth()
  // La reclutadora solo ve lo suyo (lo impone la API); el filtro es para la
  // coordinadora, que ve el trabajo de todas.
  const puedeFiltrarPorReclutadora = Boolean(user && isCoordinadora(user.role))
  const [reclutadoras, setReclutadoras] = useState<string[]>([])
  const [reclutadoraFiltro, setReclutadoraFiltro] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [listTick, setListTick] = useState(0)
  const [listLoading, setListLoading] = useState(false)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const { resumen, loading: resumenLoading, error: resumenError } = useSeguimientoResumen(
    selectedId,
    refreshKey + listTick,
    reclutadoraFiltro,
  )

  useEffect(() => {
    if (!puedeFiltrarPorReclutadora) return
    let active = true
    void (async () => {
      try {
        const data = await listReclutadorasUseCase()
        if (active) setReclutadoras(data)
      } catch {
        // Sin la lista, el filtro simplemente no se ofrece.
        if (active) setReclutadoras([])
      }
    })()
    return () => {
      active = false
    }
  }, [puedeFiltrarPorReclutadora])

  useEffect(() => {
    setEstadoFiltro('')
    setListTick(0)
  }, [selectedId])

  const campoLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    for (const campo of selected?.camposEspecificos ?? []) {
      labels[campo.nombreCampo] = campo.etiqueta
    }
    return labels
  }, [selected])

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
        <Card className={styles.workspaceCard} padding="none">
          <div className={`${styles.workspaceSwitch} ${styles.workspaceSwitchSplit}`}>
            <div className={styles.workspaceHeading}>
              <p className={styles.workspaceHeadingLead}>Seguimiento</p>
              <h2 className={styles.workspaceHeadingName}>Panel de reclutamientos</h2>
            </div>

            <div className={styles.workspaceSelector}>
              {shellReady ? (
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
                        setSelectedId(e.target.value)
                        setRefreshKey((value) => value + 1)
                      }}
                      options={proyectos.map((item) => ({
                        value: item.id,
                        label: item.nombre,
                      }))}
                    />
                  </div>

                  {puedeFiltrarPorReclutadora && reclutadoras.length > 0 ? (
                    <>
                      <span className={styles.selectorLabel}>Reclutadora:</span>
                      <div className={styles.selectorControl}>
                        <Select
                          variant="pills"
                          label="Filtro por reclutadora"
                          name="reclutadora"
                          value={reclutadoraFiltro}
                          icon={<IconUsers size={16} />}
                          onChange={(e) => {
                            setReclutadoraFiltro(e.target.value)
                            setRefreshKey((value) => value + 1)
                          }}
                          options={[
                            { value: '', label: 'Todas' },
                            ...reclutadoras.map((nombre) => ({ value: nombre, label: nombre })),
                          ]}
                        />
                      </div>
                    </>
                  ) : null}
                </>
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

              <div className={styles.panelSectionActions}>
                {shellReady ? (
                  <>
                    <SeguimientoEstadoFilter
                      value={estadoFiltro}
                      onChange={setEstadoFiltro}
                      disabled={listLoading}
                    />
                    <SeguimientoRefreshButton
                      loading={listLoading}
                      onClick={() => setListTick((value) => value + 1)}
                    />
                  </>
                ) : (
                  <SkeletonBlock height={48} />
                )}
              </div>
            </header>

            <SoftSwap loading={!shellReady} skeleton={<SkeletonBlock height={220} />}>
              {selected ? (
                <SeguimientoPanel
                  proyectoId={selected.id}
                  reclutadora={reclutadoraFiltro}
                  refreshKey={refreshKey}
                  listTick={listTick}
                  estado={estadoFiltro}
                  campoLabels={campoLabels}
                  onLoadingChange={setListLoading}
                />
              ) : null}
            </SoftSwap>
          </section>
        </Card>
      ) : null}
    </div>
  )
}
