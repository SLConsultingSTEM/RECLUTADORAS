import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  createEmptyCampo,
  duplicateCampo,
  htmlTypeForCampo,
  isMultilineCampo,
  placeholderForCampoTipo,
  toPersistableCampos,
  type CampoEditable,
} from '@modules/proyectos/application/camposEspecificosHelpers'
import {
  defaultOpcionesForBaseCampo,
  isSelectLikeBaseCampo,
  isTextLikeBaseCampo,
  normalizeFormularioTitulos,
  toPersistableCamposBase,
  type CampoBaseEditable,
} from '@modules/proyectos/application/formularioConfigHelpers'
import type {
  CampoBaseInputTipo,
  CampoBaseKey,
  FormularioTitulos,
  Proyecto,
} from '@modules/proyectos/domain/types'
import { TIPOS_DOCUMENTO } from '@modules/participantes/domain/types'
import { buildParticipanteSchema } from '@modules/participantes/application/participanteSchema'
import { registerParticipanteUseCase } from '@modules/participantes/application/participanteUseCases'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { CampoFormTile } from '@modules/proyectos/presentation/CampoFormTile'
import { Toast } from '@shared/ui/Toast'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Select } from '@shared/ui/Select'
import {
  IconClock,
  IconFileText,
  IconFilter,
  IconHash,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconPlus,
  IconUser,
} from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

const participanteRepository = createParticipanteRepository()

function resolveFieldName(errorKey: string) {
  return errorKey.startsWith('camposExtra.') ? errorKey.slice('camposExtra.'.length) : errorKey
}

function focusFirstInvalidField(
  form: HTMLFormElement,
  errors: Record<string, string>,
  fieldOrder: string[],
) {
  const firstKey = fieldOrder.find((key) => Boolean(errors[key]))
  if (!firstKey) return

  const fieldName = resolveFieldName(firstKey)
  const field = form.querySelector<HTMLElement>(`[name="${CSS.escape(fieldName)}"]`)
  if (!field) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  field.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  })

  const attentionClass = styles.attention
  if (!attentionClass) return

  field.classList.remove(attentionClass)
  void field.offsetWidth
  field.classList.add(attentionClass)

  const focusDelay = prefersReduced ? 0 : 320
  window.setTimeout(() => {
    field.focus({ preventScroll: true })
  }, focusDelay)

  window.setTimeout(() => {
    field.classList.remove(attentionClass)
  }, prefersReduced ? 0 : 800)
}

export interface ProyectoFormBuilderProps {
  campos: CampoEditable[]
  camposBase: CampoBaseEditable[]
  titulos: FormularioTitulos
  onChangeCampos: (campos: CampoEditable[]) => void
  onChangeCamposBase: (campos: CampoBaseEditable[]) => void
  onChangeTitulos: (titulos: FormularioTitulos) => void
  saving?: boolean
  error?: string
  onClearError?: () => void
}

interface ProyectoFormProps {
  proyecto: Proyecto
  onRegistered: () => void
  builder?: ProyectoFormBuilderProps
}

function SectionHeadEditor({
  icon,
  titulos,
  editable,
  disabled,
  badge,
  actions,
  onChange,
}: {
  icon: ReactNode
  titulos: { eyebrow: string; titulo: string }
  editable: boolean
  disabled?: boolean
  badge?: ReactNode
  actions?: ReactNode
  onChange?: (patch: { eyebrow?: string; titulo?: string }) => void
}) {
  const [editing, setEditing] = useState(false)
  const showEditor = editable && editing

  return (
    <div className={styles.sectionHead}>
      <div
        className={`${styles.sectionTitleWrap} ${showEditor ? styles.sectionTitleWrapEdit : ''}`}
      >
        <span className={styles.sectionIcon}>{icon}</span>
        {showEditor ? (
          <div className={styles.sectionTitleEditor}>
            <label className={styles.sectionNameField}>
              <span>Etiqueta</span>
              <input
                type="text"
                value={titulos.eyebrow}
                disabled={disabled}
                placeholder="Ej. Datos base"
                autoFocus
                onChange={(e) => onChange?.({ eyebrow: e.target.value })}
              />
            </label>
            <label className={styles.sectionNameField}>
              <span>Título</span>
              <input
                type="text"
                value={titulos.titulo}
                disabled={disabled}
                placeholder="Ej. Información del participante"
                onChange={(e) => onChange?.({ titulo: e.target.value })}
              />
            </label>
            <div className={styles.sectionTitleEditorActions}>
              <Button
                type="button"
                variant="soft"
                size="sm"
                className={styles.sectionTitleDoneBtn}
                disabled={disabled}
                onClick={() => setEditing(false)}
              >
                Listo
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.sectionTitleView}>
            <div className={styles.sectionTitleBlock}>
              <span className={styles.sectionEyebrow}>{titulos.eyebrow}</span>
              <h4 className={styles.sectionTitle}>{titulos.titulo}</h4>
            </div>
            {editable ? (
              <button
                type="button"
                className={styles.sectionTitlePencil}
                disabled={disabled}
                aria-label="Editar títulos de la sección"
                title="Editar títulos"
                onClick={() => setEditing(true)}
              >
                <IconPencil size={14} />
              </button>
            ) : null}
          </div>
        )}
      </div>
      <div className={styles.sectionHeadActions}>
        <div className={styles.sectionHeadMeta}>{!editing ? badge : null}</div>
        {!editing ? actions : null}
      </div>
    </div>
  )
}

export function ProyectoForm({ proyecto, onRegistered, builder }: ProyectoFormProps) {
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const canBuild = Boolean(builder)
  const requireCamposEspecificos = Boolean(user && isCoordinadora(user.role))

  const camposEspecificos = useMemo(
    () => (builder ? toPersistableCampos(builder.campos) : proyecto.camposEspecificos),
    [builder, builder?.campos, proyecto.camposEspecificos],
  )

  const camposBase = useMemo(
    () =>
      builder
        ? toPersistableCamposBase(builder.camposBase, proyecto.ciudadesPermitidas)
        : toPersistableCamposBase(
            (proyecto.camposBase ?? []).map((campo) => ({
              ...campo,
              id: `base-${campo.nombreCampo}`,
            })),
            proyecto.ciudadesPermitidas,
          ),
    [builder, builder?.camposBase, proyecto.camposBase, proyecto.ciudadesPermitidas],
  )

  const titulos = useMemo(
    () =>
      normalizeFormularioTitulos(
        builder?.titulos ?? proyecto.titulosFormulario,
      ),
    [builder?.titulos, proyecto.titulosFormulario],
  )

  const schema = useMemo(
    () =>
      buildParticipanteSchema(camposEspecificos, {
        requireCamposEspecificos,
        camposBase,
      }),
    [camposEspecificos, requireCamposEspecificos, camposBase],
  )

  const [nombre, setNombre] = useState('')
  const [genero, setGenero] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [documento, setDocumento] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [camposExtra, setCamposExtra] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [dragGroup, setDragGroup] = useState<'base' | 'extra' | null>(null)

  const baseValues: Record<CampoBaseKey, string> = {
    nombre,
    genero,
    tipoDocumento,
    documento,
    ciudad,
    telefono,
  }

  function setBaseValue(key: CampoBaseKey, value: string) {
    clearFieldError(key)
    switch (key) {
      case 'nombre':
        setNombre(value)
        break
      case 'genero':
        setGenero(value)
        break
      case 'tipoDocumento':
        setTipoDocumento(value)
        break
      case 'documento':
        setDocumento(value)
        break
      case 'ciudad':
        setCiudad(value)
        break
      case 'telefono':
        setTelefono(value)
        break
    }
  }

  function resetForm() {
    setNombre('')
    setGenero('')
    setTipoDocumento('')
    setDocumento('')
    setCiudad('')
    setTelefono('')
    setCamposExtra({})
    setErrors({})
    setSuccess('')
    setError('')
    setNotice('')
  }

  useEffect(() => {
    resetForm()
  }, [proyecto.id])

  useEffect(() => {
    const allowed = new Set(camposEspecificos.map((campo) => campo.nombreCampo))
    setCamposExtra((prev) => {
      const next: Record<string, string> = {}
      let changed = false
      for (const [key, value] of Object.entries(prev)) {
        if (allowed.has(key)) next[key] = value
        else changed = true
      }
      return changed || Object.keys(next).length !== Object.keys(prev).length ? next : prev
    })
  }, [camposEspecificos])

  function clearFieldError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setError((prev) => (prev ? '' : prev))
    setSuccess((prev) => (prev ? '' : prev))
    setNotice((prev) => (prev ? '' : prev))
  }

  function updateExtra(key: string, value: string) {
    clearFieldError(`camposExtra.${key}`)
    setCamposExtra((prev) => ({ ...prev, [key]: value }))
  }

  function isFormBlank() {
    const baseBlank = [nombre, genero, tipoDocumento, documento, ciudad, telefono].every(
      (value) => !value.trim(),
    )
    if (!baseBlank) return false
    return camposEspecificos.every(
      (campo) => !(camposExtra[campo.nombreCampo] ?? '').trim(),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess('')
    setError('')
    setNotice('')

    if (isFormBlank()) {
      setErrors({})
      setNotice('No has ingresado datos')
      return
    }

    const parsed = schema.safeParse({
      nombre,
      genero,
      tipoDocumento,
      documento,
      ciudad,
      telefono,
      camposExtra: Object.fromEntries(
        camposEspecificos.map((campo) => [
          campo.nombreCampo,
          camposExtra[campo.nombreCampo] ?? '',
        ]),
      ),
    })

    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        next[key] = issue.message
      }
      setErrors(next)
      const form = formRef.current
      if (form) {
        window.requestAnimationFrame(() => {
          focusFirstInvalidField(form, next, [
            ...camposBase.map((campo) => campo.nombreCampo),
            ...camposEspecificos.map((campo) => `camposExtra.${campo.nombreCampo}`),
          ])
        })
      }
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await registerParticipanteUseCase(participanteRepository, {
        proyectoId: proyecto.id,
        ...parsed.data,
        creadoPor: user?.username ?? 'desconocido',
      })
      resetForm()
      setSuccess('Participante registrado correctamente')
      onRegistered()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  function updateBuilderCampo(id: string, patch: Partial<CampoEditable>) {
    if (!builder) return
    builder.onChangeCampos(
      builder.campos.map((campo) => (campo.id === id ? { ...campo, ...patch } : campo)),
    )
  }

  function updateBuilderCampoBase(id: string, patch: Partial<CampoBaseEditable>) {
    if (!builder) return
    builder.onChangeCamposBase(
      builder.camposBase.map((campo) => (campo.id === id ? { ...campo, ...patch } : campo)),
    )
  }

  function addBuilderCampo() {
    if (!builder) return
    builder.onChangeCampos([...builder.campos, createEmptyCampo(builder.campos)])
  }

  function duplicateBuilderCampo(id: string) {
    if (!builder) return
    const index = builder.campos.findIndex((campo) => campo.id === id)
    if (index < 0) return
    const source = builder.campos[index]
    if (!source) return
    const copy = duplicateCampo(source, builder.campos)
    const next = [...builder.campos]
    next.splice(index + 1, 0, copy)
    builder.onChangeCampos(next)
  }

  function removeBuilderCampo(id: string) {
    if (!builder) return
    builder.onChangeCampos(builder.campos.filter((campo) => campo.id !== id))
  }

  function removeBuilderCampoBase(id: string) {
    if (!builder) return
    builder.onChangeCamposBase(builder.camposBase.filter((campo) => campo.id !== id))
  }

  function duplicateBuilderCampoBase(id: string) {
    if (!builder) return
    const source = builder.camposBase.find((campo) => campo.id === id)
    if (!source) return

    const copy = createEmptyCampo(builder.campos)
    const baseLabel = source.etiqueta.trim() || source.nombreCampo
    copy.etiqueta = `${baseLabel} (copia)`
    copy.requerido = Boolean(source.requerido)

    if (isSelectLikeBaseCampo(source.nombreCampo)) {
      copy.tipo = 'select'
      copy.opciones = source.opciones?.length
        ? [...source.opciones]
        : source.nombreCampo === 'ciudad'
          ? [...proyecto.ciudadesPermitidas]
          : []
    } else {
      copy.tipo = source.tipo ?? 'text'
    }

    builder.onChangeCampos([...builder.campos, copy])
  }

  function reorderById<T extends { id: string }>(items: T[], fromId: string, toId: string): T[] {
    if (fromId === toId) return items
    const fromIndex = items.findIndex((item) => item.id === fromId)
    const toIndex = items.findIndex((item) => item.id === toId)
    if (fromIndex < 0 || toIndex < 0) return items
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    if (!moved) return items
    next.splice(toIndex, 0, moved)
    return next
  }

  function handleTileDragStart(
    group: 'base' | 'extra',
    id: string,
    event: DragEvent<HTMLElement>,
  ) {
    setDragGroup(group)
    setDragId(id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  function handleTileDragOver(group: 'base' | 'extra', id: string, event: DragEvent<HTMLElement>) {
    if (dragGroup && dragGroup !== group) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dropId !== id) setDropId(id)
  }

  function handleTileDrop(group: 'base' | 'extra', id: string, event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (!builder) return
    const fromId = event.dataTransfer.getData('text/plain') || dragId
    if (!fromId) return
    if (group === 'base') {
      builder.onChangeCamposBase(reorderById(builder.camposBase, fromId, id))
    } else {
      builder.onChangeCampos(reorderById(builder.campos, fromId, id))
    }
    setDragId(null)
    setDropId(null)
    setDragGroup(null)
  }

  function clearDragState() {
    setDragId(null)
    setDropId(null)
    setDragGroup(null)
  }

  const filtroCount = canBuild ? (builder?.campos.length ?? 0) : proyecto.camposEspecificos.length
  const showFiltroSection = canBuild || filtroCount > 0
  const busyBuilder = Boolean(builder?.saving)

  const floatingBar = (
    <div className={styles.floatingBar} role="toolbar" aria-label="Acciones del registro">
      <Button
        type="button"
        variant="secondary"
        className={styles.floatingBtn}
        disabled={loading || busyBuilder}
        onClick={resetForm}
      >
        Descartar
      </Button>
      <Button
        type="button"
        className={styles.floatingBtn}
        loading={loading}
        disabled={busyBuilder}
        onClick={() => formRef.current?.requestSubmit()}
      >
        Guardar
      </Button>
    </div>
  )

  function iconForInputTipo(
    tipo: CampoBaseInputTipo | CampoEditable['tipo'] | undefined,
    nombreCampo?: 'nombre' | 'documento' | 'telefono' | string,
  ) {
    switch (tipo) {
      case 'email':
        return <IconMail size={16} />
      case 'tel':
        return <IconPhone size={16} />
      case 'date':
        return <IconClock size={16} />
      case 'number':
        return <IconHash size={16} />
      case 'textarea':
        return <IconFileText size={16} />
      case 'text':
      default:
        if (nombreCampo === 'telefono') return <IconPhone size={16} />
        if (nombreCampo === 'nombre') return <IconUser size={16} />
        return undefined
    }
  }

  function renderExtraControl(campo: {
    nombreCampo: string
    etiqueta: string
    tipo: string
    opciones?: string[]
    requerido?: boolean
  }) {
    const label = campo.etiqueta.trim() || 'Nuevo campo'
    const required = requireCamposEspecificos && campo.requerido
    const tipo = campo.tipo as CampoEditable['tipo']

    if (campo.tipo === 'select') {
      return (
        <Select
          label={label}
          name={campo.nombreCampo}
          value={camposExtra[campo.nombreCampo] ?? ''}
          onChange={(e) => updateExtra(campo.nombreCampo, e.target.value)}
          options={[
            { value: '', label: 'Seleccione…' },
            ...(campo.opciones ?? []).map((opcion) => ({
              value: opcion,
              label: opcion,
            })),
          ]}
          error={errors[`camposExtra.${campo.nombreCampo}`]}
          required={required}
        />
      )
    }

    if (isMultilineCampo(tipo)) {
      return (
        <Textarea
          label={label}
          name={campo.nombreCampo}
          value={camposExtra[campo.nombreCampo] ?? ''}
          onChange={(e) => updateExtra(campo.nombreCampo, e.target.value)}
          error={errors[`camposExtra.${campo.nombreCampo}`]}
          placeholder={placeholderForCampoTipo(tipo, label)}
          required={required}
        />
      )
    }

    return (
      <Input
        label={label}
        name={campo.nombreCampo}
        type={htmlTypeForCampo(tipo)}
        value={camposExtra[campo.nombreCampo] ?? ''}
        onChange={(e) => updateExtra(campo.nombreCampo, e.target.value)}
        error={errors[`camposExtra.${campo.nombreCampo}`]}
        icon={iconForInputTipo(tipo)}
        placeholder={placeholderForCampoTipo(tipo, label)}
        required={required}
      />
    )
  }

  function renderBaseTextControl(options: {
    nombreCampo: 'nombre' | 'documento' | 'telefono'
    label: string
    value: string
    error?: string
    required: boolean
    tipo?: CampoBaseInputTipo
  }) {
    const { nombreCampo, label, value, error, required, tipo } = options
    const resolvedTipo = tipo ?? 'text'

    if (isMultilineCampo(resolvedTipo)) {
      return (
        <Textarea
          label={label}
          name={nombreCampo}
          value={value}
          onChange={(e) => setBaseValue(nombreCampo, e.target.value)}
          error={error}
          placeholder={placeholderForCampoTipo(resolvedTipo, label)}
          required={required}
        />
      )
    }

    return (
      <Input
        label={label}
        name={nombreCampo}
        type={htmlTypeForCampo(resolvedTipo)}
        value={value}
        onChange={(e) => setBaseValue(nombreCampo, e.target.value)}
        error={error}
        icon={iconForInputTipo(resolvedTipo, nombreCampo)}
        placeholder={placeholderForCampoTipo(resolvedTipo, label)}
        inputMode={
          resolvedTipo === 'tel' || resolvedTipo === 'number'
            ? 'numeric'
            : nombreCampo === 'telefono' && resolvedTipo === 'text'
              ? 'numeric'
              : undefined
        }
        required={required}
      />
    )
  }

  function selectOptionsFromList(opciones: string[]) {
    const labelByValue = new Map<string, string>(
      TIPOS_DOCUMENTO.map((item) => [item.value, item.label]),
    )
    return [
      { value: '', label: 'Seleccione…' },
      ...opciones.map((value) => ({
        value,
        label: labelByValue.get(value) ?? value,
      })),
    ]
  }

  function renderBaseControl(campo: {
    nombreCampo: CampoBaseKey
    etiqueta: string
    requerido?: boolean
    tipo?: CampoBaseInputTipo
    opciones?: string[]
  }) {
    const label = campo.etiqueta.trim() || campo.nombreCampo
    const required = Boolean(campo.requerido)

    switch (campo.nombreCampo) {
      case 'nombre':
        return renderBaseTextControl({
          nombreCampo: 'nombre',
          label,
          value: baseValues.nombre,
          error: errors.nombre,
          required,
          tipo: campo.tipo,
        })
      case 'genero':
        return (
          <Select
            label={label}
            name="genero"
            value={baseValues.genero}
            onChange={(e) => setBaseValue('genero', e.target.value)}
            options={selectOptionsFromList(
              campo.opciones?.length
                ? campo.opciones
                : ['Masculino', 'Femenino'],
            )}
            error={errors.genero}
            required={required}
          />
        )
      case 'tipoDocumento':
        return (
          <Select
            label={label}
            name="tipoDocumento"
            value={baseValues.tipoDocumento}
            onChange={(e) => setBaseValue('tipoDocumento', e.target.value)}
            options={selectOptionsFromList(
              campo.opciones?.length
                ? campo.opciones
                : TIPOS_DOCUMENTO.map((item) => item.value),
            )}
            error={errors.tipoDocumento}
            required={required}
          />
        )
      case 'documento':
        return renderBaseTextControl({
          nombreCampo: 'documento',
          label,
          value: baseValues.documento,
          error: errors.documento,
          required,
          tipo: campo.tipo,
        })
      case 'ciudad':
        return (
          <Select
            label={label}
            name="ciudad"
            value={baseValues.ciudad}
            onChange={(e) => setBaseValue('ciudad', e.target.value)}
            options={selectOptionsFromList(
              campo.opciones?.length
                ? campo.opciones
                : proyecto.ciudadesPermitidas,
            )}
            error={errors.ciudad}
            icon={<IconMapPin size={16} />}
            required={required}
          />
        )
      case 'telefono':
        return renderBaseTextControl({
          nombreCampo: 'telefono',
          label,
          value: baseValues.telefono,
          error: errors.telefono,
          required,
          tipo: campo.tipo,
        })
    }
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section}>
        <SectionHeadEditor
          icon={<IconUser size={15} />}
          titulos={titulos.base}
          editable={canBuild}
          disabled={busyBuilder}
          badge={
            <>
              {builder?.saving ? <span className={styles.dirtyBadge}>Guardando…</span> : null}
              <span className={styles.badge}>{camposBase.length} campos</span>
            </>
          }
          onChange={(patch) => {
            if (!builder) return
            builder.onChangeTitulos({
              ...builder.titulos,
              base: { ...builder.titulos.base, ...patch },
            })
          }}
        />

        <div className={styles.grid}>
          {canBuild ? (
            <button
              type="button"
              className={styles.addCampoTile}
              disabled={busyBuilder}
              onClick={addBuilderCampo}
            >
              <IconPlus size={20} />
              <span>Agregar campo</span>
              <small>Se coloca al final</small>
            </button>
          ) : null}

          {canBuild && builder
            ? builder.camposBase.map((campo) => (
                <CampoFormTile
                  key={campo.id}
                  locked
                  campo={{
                    ...campo,
                    tipo: isSelectLikeBaseCampo(campo.nombreCampo) ? 'select' : campo.tipo,
                    baseInput: isTextLikeBaseCampo(campo.nombreCampo),
                    baseSelect: isSelectLikeBaseCampo(campo.nombreCampo),
                    defaultOpciones: isSelectLikeBaseCampo(campo.nombreCampo)
                      ? defaultOpcionesForBaseCampo(
                          campo.nombreCampo,
                          proyecto.ciudadesPermitidas,
                        )
                      : undefined,
                  }}
                  disabled={false}
                  isDragging={dragId === campo.id}
                  isDropTarget={
                    dragGroup === 'base' && dropId === campo.id && dragId !== campo.id
                  }
                  onDragStart={(event) => handleTileDragStart('base', campo.id, event)}
                  onDragOver={(event) => handleTileDragOver('base', campo.id, event)}
                  onDragLeave={() => setDropId((prev) => (prev === campo.id ? null : prev))}
                  onDrop={(event) => handleTileDrop('base', campo.id, event)}
                  onDragEnd={clearDragState}
                  onChange={(patch) => {
                    const next: Partial<CampoBaseEditable> = {}
                    if (patch.etiqueta !== undefined) next.etiqueta = patch.etiqueta
                    if (patch.requerido !== undefined) next.requerido = patch.requerido
                    if (
                      patch.tipo !== undefined &&
                      isTextLikeBaseCampo(campo.nombreCampo) &&
                      patch.tipo !== 'select'
                    ) {
                      next.tipo = patch.tipo
                    }
                    if (
                      patch.opciones !== undefined &&
                      isSelectLikeBaseCampo(campo.nombreCampo)
                    ) {
                      next.opciones = patch.opciones
                    }
                    updateBuilderCampoBase(campo.id, next)
                  }}
                  onDuplicate={() => duplicateBuilderCampoBase(campo.id)}
                  onRemove={() => removeBuilderCampoBase(campo.id)}
                >
                  {renderBaseControl({
                    ...campo,
                    opciones: campo.opciones?.length
                      ? campo.opciones
                      : isSelectLikeBaseCampo(campo.nombreCampo)
                        ? defaultOpcionesForBaseCampo(
                            campo.nombreCampo,
                            proyecto.ciudadesPermitidas,
                          )
                        : campo.opciones,
                  })}
                </CampoFormTile>
              ))
            : camposBase.map((campo) => (
                <div key={campo.nombreCampo}>{renderBaseControl(campo)}</div>
              ))}
        </div>
      </section>

      {showFiltroSection ? (
        <section className={styles.section}>
          <SectionHeadEditor
            icon={<IconFilter size={15} />}
            titulos={
              canBuild
                ? titulos.filtro
                : {
                    ...titulos.filtro,
                    titulo: requireCamposEspecificos
                      ? titulos.filtro.titulo
                      : 'Campos específicos del proyecto',
                  }
            }
            editable={canBuild}
            disabled={busyBuilder}
            badge={
              <span className={styles.badge}>
                {filtroCount} {filtroCount === 1 ? 'campo' : 'campos'}
              </span>
            }
            actions={
              canBuild ? (
                <Button
                  type="button"
                  variant="soft"
                  className={styles.addCampoBtn}
                  icon={<IconPlus size={16} />}
                  disabled={busyBuilder}
                  onClick={addBuilderCampo}
                >
                  Agregar
                </Button>
              ) : null
            }
            onChange={(patch) => {
              if (!builder) return
              builder.onChangeTitulos({
                ...builder.titulos,
                filtro: { ...builder.titulos.filtro, ...patch },
              })
            }}
          />

          <div className={styles.grid}>
            {canBuild ? (
              <button
                type="button"
                className={styles.addCampoTile}
                disabled={busyBuilder}
                onClick={addBuilderCampo}
              >
                <IconPlus size={20} />
                <span>Agregar campo</span>
                <small>Se coloca al final</small>
              </button>
            ) : null}

            {canBuild && builder
              ? builder.campos.map((campo) => (
                  <CampoFormTile
                    key={campo.id}
                    campo={campo}
                    disabled={false}
                    isDragging={dragId === campo.id}
                    isDropTarget={
                      dragGroup === 'extra' && dropId === campo.id && dragId !== campo.id
                    }
                    onDragStart={(event) => handleTileDragStart('extra', campo.id, event)}
                    onDragOver={(event) => handleTileDragOver('extra', campo.id, event)}
                    onDragLeave={() => setDropId((prev) => (prev === campo.id ? null : prev))}
                    onDrop={(event) => handleTileDrop('extra', campo.id, event)}
                    onDragEnd={clearDragState}
                    onChange={(patch) => updateBuilderCampo(campo.id, patch)}
                    onDuplicate={() => duplicateBuilderCampo(campo.id)}
                    onRemove={() => removeBuilderCampo(campo.id)}
                  >
                    {renderExtraControl(campo)}
                  </CampoFormTile>
                ))
              : proyecto.camposEspecificos.map((campo) => (
                  <div key={campo.nombreCampo}>{renderExtraControl(campo)}</div>
                ))}
          </div>
        </section>
      ) : null}

      {success ? (
        <Toast tone="success" onClose={() => setSuccess('')}>
          {success}
        </Toast>
      ) : error ? (
        <Toast tone="error" onClose={() => setError('')}>
          {error}
        </Toast>
      ) : notice ? (
        <Toast tone="info" onClose={() => setNotice('')}>
          {notice}
        </Toast>
      ) : builder?.error ? (
        <Toast tone="error" onClose={builder.onClearError}>
          {builder.error}
        </Toast>
      ) : null}

      {typeof document !== 'undefined' ? createPortal(floatingBar, document.body) : floatingBar}
    </form>
  )
}
