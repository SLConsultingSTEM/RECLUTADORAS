import { Link } from 'react-router-dom'
import { useProyectos } from '@modules/proyectos/presentation/useProyectos'
import { ProyectoInfo } from '@modules/proyectos/presentation/ProyectoInfo'
import { ProyectoForm } from '@modules/proyectos/presentation/ProyectoForm'
import { Alert } from '@shared/ui/Alert'
import { Card, CardHeader } from '@shared/ui/Card'
import { EmptyState } from '@shared/ui/EmptyState'
import { Select } from '@shared/ui/Select'
import { LoadingRow, SkeletonBlock } from '@shared/ui/Skeleton'
import {
  IconFileText,
  IconFolder,
  IconInbox,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './HomePage.module.css'

export function NuevoRegistroPage() {
  const { proyectos, selected, selectedId, setSelectedId, loading, error } = useProyectos()

  return (
    <div className={styles.page}>
      {error ? <Alert tone="error" title="No se pudo cargar">{error}</Alert> : null}

      {loading ? (
        <div className={styles.workspaceStack}>
          <SkeletonBlock height={88} />
          <SkeletonBlock height={320} />
          <LoadingRow label="Cargando proyectos…" />
        </div>
      ) : null}

      {!loading && proyectos.length === 0 && !error ? (
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

      {!loading && proyectos.length > 0 ? (
        <>
          <section className={styles.toolbar}>
            <div className={styles.toolbarCopy}>
              <span className={styles.toolbarLabel}>Registro</span>
              <h2 className={styles.toolbarTitle}>{selected?.nombre ?? 'Nuevo participante'}</h2>
            </div>

            <div className={styles.toolbarActions}>
              <div className={styles.selector}>
                <Select
                  label="Proyecto"
                  name="proyecto"
                  value={selectedId}
                  icon={<IconFolder size={16} />}
                  onChange={(e) => setSelectedId(e.target.value)}
                  options={proyectos.map((item) => ({
                    value: item.id,
                    label: item.nombre,
                  }))}
                />
              </div>
            </div>
          </section>

          {selected ? (
            <section className={styles.workspace}>
              <Card delay={40}>
                <CardHeader
                  eyebrow="Referencia"
                  title="Condiciones"
                  icon={<IconFileText size={18} />}
                />
                <ProyectoInfo
                  nombre={selected.nombre}
                  descripcionHtml={selected.descripcionHtml}
                  imagenUrl={selected.imagenUrl}
                  imagenNombre={selected.imagenNombre}
                  ciudades={selected.ciudadesPermitidas}
                  camposCount={selected.camposEspecificos.length}
                  compact
                />
              </Card>

              <Card delay={100}>
                <CardHeader
                  eyebrow="Captura"
                  title="Datos del participante"
                  icon={<IconUserPlus size={18} />}
                />
                <ProyectoForm proyecto={selected} onRegistered={() => undefined} />
              </Card>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
