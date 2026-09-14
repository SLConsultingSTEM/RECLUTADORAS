import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import {
  areCamposEqual,
  toEditableCampos,
  toPersistableCampos,
  type CampoEditable,
} from '@modules/proyectos/application/camposEspecificosHelpers'
import {
  areCamposBaseEqual,
  areFormularioTitulosEqual,
  normalizeFormularioTitulos,
  toEditableCamposBase,
  toPersistableCamposBase,
  type CampoBaseEditable,
} from '@modules/proyectos/application/formularioConfigHelpers'
import type { FormularioTitulos } from '@modules/proyectos/domain/types'
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
  IconFileText,
  IconFolder,
  IconInbox,
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

  const [camposDraft, setCamposDraft] = useState<CampoEditable[]>([])
  const [camposBaseDraft, setCamposBaseDraft] = useState<CampoBaseEditable[]>([])
  const [titulosDraft, setTitulosDraft] = useState<FormularioTitulos>(() =>
    normalizeFormularioTitulos(null),
  )
  const [camposSaving, setCamposSaving] = useState(false)
  const [camposError, setCamposError] = useState('')

  // Solo al cambiar de proyecto; el guardado del editor sincroniza el draft a mano.
  useEffect(() => {
    if (!selected) {
      setCamposDraft([])
      setCamposBaseDraft([])
      setTitulosDraft(normalizeFormularioTitulos(null))
      setCamposError('')
      return
    }
    setCamposDraft(toEditableCampos(selected.camposEspecificos))
    setCamposBaseDraft(toEditableCamposBase(selected.camposBase, selected.ciudadesPermitidas))
    setTitulosDraft(normalizeFormularioTitulos(selected.titulosFormulario))
    setCamposError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- evitar pisar el draft al guardar
  }, [selected?.id])

  const camposPersistibles = useMemo(
    () => toPersistableCampos(camposDraft),
    [camposDraft],
  )
  const camposBasePersistibles = useMemo(
    () => toPersistableCamposBase(camposBaseDraft, selected?.ciudadesPermitidas ?? []),
    [camposBaseDraft, selected?.ciudadesPermitidas],
  )
  const titulosPersistibles = useMemo(
    () => normalizeFormularioTitulos(titulosDraft),
    [titulosDraft],
  )

  const camposDirty = Boolean(
    selected &&
      (!areCamposEqual(camposPersistibles, selected.camposEspecificos) ||
        !areCamposBaseEqual(
          camposBasePersistibles,
          selected.camposBase ?? [],
          selected.ciudadesPermitidas,
        ) ||
        !areFormularioTitulosEqual(
          titulosPersistibles,
          normalizeFormularioTitulos(selected.titulosFormulario),
        )),
  )

  function clearDraftFeedback() {
    setCamposError('')
  }

  async function handleSaveCampos() {
    if (!selected) return
    setCamposSaving(true)
    setCamposError('')
    try {
      await updateSelected({
        camposEspecificos: camposPersistibles,
        camposBase: camposBasePersistibles,
        titulosFormulario: titulosPersistibles,
      })
      // Mantener el draft local para no interrumpir la edición ni perder foco.
    } catch (err) {
      setCamposError(err instanceof Error ? err.message : 'No se pudo guardar el diseño')
    } finally {
      setCamposSaving(false)
    }
  }

  useEffect(() => {
    if (!canEditInfo || !selected || !camposDirty || camposSaving) return
    const timer = window.setTimeout(() => {
      void handleSaveCampos()
    }, 1100)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- autosave al cambiar el draft
  }, [
    canEditInfo,
    selected?.id,
    camposDirty,
    camposPersistibles,
    camposBasePersistibles,
    titulosPersistibles,
    camposSaving,
  ])

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
      icon: <IconFileText size={16} />,
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
        <Card className={styles.workspaceCard} padding="none">
          <div className={`${styles.workspaceSwitch} ${styles.workspaceSwitchSplit}`}>
            <div className={`${styles.viewTabs} ${styles.viewTabsMobileHidden}`}>
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
            </div>

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
                  builder={
                    canEditInfo
                      ? {
                          campos: camposDraft,
                          camposBase: camposBaseDraft,
                          titulos: titulosDraft,
                          onChangeCampos: (items) => {
                            setCamposDraft(items)
                            clearDraftFeedback()
                          },
                          onChangeCamposBase: (items) => {
                            setCamposBaseDraft(items)
                            clearDraftFeedback()
                          },
                          onChangeTitulos: (next) => {
                            setTitulosDraft(next)
                            clearDraftFeedback()
                          },
                          saving: camposSaving,
                          error: camposError,
                        }
                      : undefined
                  }
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
