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
  CAMPO_BASE_KEYS,
  campoBaseEditable,
  defaultOpcionesForBaseCampo,
  etiquetaCampoBase,
  isCampoBaseFijo,
  isSelectLikeBaseCampo,
  isTextLikeBaseCampo,
  normalizeCamposBase,
  normalizeFormularioTitulos,
  toPersistableCamposBase,
  type CampoBaseEditable,
} from '@modules/proyectos/application/formularioConfigHelpers'
import type {
  CampoBaseInputTipo,
  CampoBaseKey,
  CampoTipo,
  DestinoCampo,
  FormularioTitulos,
  Proyecto,
} from '@modules/proyectos/domain/types'
import { TIPOS_DOCUMENTO } from '@modules/participantes/domain/types'
import {
  buildParticipanteSchema,
  LARGO_MAXIMO_TELEFONO,
} from '@modules/participantes/application/participanteSchema'
import { registerParticipanteUseCase } from '@modules/participantes/application/participanteUseCases'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { CampoFormTile } from '@modules/proyectos/presentation/CampoFormTile'
import {
  AgregarCampoTile,
  type OpcionAgregarCampo,
} from '@modules/proyectos/presentation/AgregarCampoTile'
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
  IconTrash,
  IconUser,
} from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

const participanteRepository = createParticipanteRepository()

/** "Cuestionario · Marca" → grupo "Cuestionario", nombre "Marca". */
function separarEtiquetaDestino(etiqueta: string) {
  const corte = etiqueta.indexOf(' · ')
  if (corte < 0) return { grupo: '', nombre: etiqueta }
  return { grupo: etiqueta.slice(0, corte), nombre: etiqueta.slice(corte + 3) }
}

/** Mismo tipo con el que la API publica cada columna. */
function tipoParaDestino(destino: string): CampoTipo {
  if (destino.endsWith('.birth_date')) return 'date'
  if (destino === 'participante.email') return 'email'
  return 'text'
}

function resolveFieldName(errorKey: string) {
  if (errorKey === 'telefonos') return 'telefonos.0'
  return errorKey.startsWith('camposExtra.') ? errorKey.slice('camposExtra.'.length) : errorKey
}

const MAXIMO_TELEFONOS = 5

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
  /** Hay cambios en el diseño del formulario sin guardar. */
  dirty?: boolean
  /** Guarda el diseño (campos, etiquetas y títulos) del formulario. */
  onSave?: () => void
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
        : normalizeCamposBase(proyecto.camposBase, proyecto.ciudadesPermitidas),
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
  const [telefonos, setTelefonos] = useState<string[]>([''])
  const [camposExtra, setCamposExtra] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [dragGroup, setDragGroup] = useState<'base' | 'extra' | null>(null)

  const baseValues: Record<Exclude<CampoBaseKey, 'telefono'>, string> = {
    nombre,
    genero,
    tipoDocumento,
    documento,
    ciudad,
  }

  function updateTelefono(index: number, value: string) {
    clearFieldError(`telefonos.${index}`)
    clearFieldError('telefonos')
    setTelefonos((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function quitarTelefono(index: number) {
    setErrors((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith('telefonos'))),
    )
    setTelefonos((prev) => prev.filter((_, i) => i !== index))
  }

  function setBaseValue(key: Exclude<CampoBaseKey, 'telefono'>, value: string) {
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
    }
  }

  function resetForm() {
    setNombre('')
    setGenero('')
    setTipoDocumento('')
    setDocumento('')
    setCiudad('')
    setTelefonos([''])
    setCamposExtra({})
    setErrors({})
    setSuccess('')
    setAviso('')
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
    setAviso((prev) => (prev ? '' : prev))
    setNotice((prev) => (prev ? '' : prev))
  }

  function updateExtra(key: string, value: string) {
    clearFieldError(`camposExtra.${key}`)
    setCamposExtra((prev) => ({ ...prev, [key]: value }))
  }

  function isFormBlank() {
    const baseBlank = [nombre, genero, tipoDocumento, documento, ciudad, ...telefonos].every(
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
    setAviso('')
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
      telefonos,
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
            ...camposBase.flatMap((campo) =>
              campo.nombreCampo === 'telefono'
                ? ['telefonos', ...telefonos.map((_, i) => `telefonos.${i}`)]
                : [campo.nombreCampo],
            ),
            ...camposEspecificos.map((campo) => `camposExtra.${campo.nombreCampo}`),
          ])
        })
      }
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const camposCorreo = new Set(
        [...camposBase, ...camposEspecificos]
          .filter((campo) => campo.tipo === 'email')
          .map((campo) => campo.nombreCampo),
      )
      const registrado = await registerParticipanteUseCase(
        participanteRepository,
        {
          proyectoId: proyecto.id,
          ...parsed.data,
          creadoPor: user?.username ?? 'desconocido',
        },
        camposCorreo,
      )
      resetForm()
      // La persona puede quedar guardada sin inscripción (Lista Clinton): no es
      // un error y no hay que volver a intentarlo, pero tampoco es un éxito.
      if (registrado.inscrito === false) {
        setAviso(registrado.motivo || 'La persona quedó registrada, pero no se inscribió al proyecto.')
      } else {
        setSuccess('Participante registrado correctamente')
      }
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

  // Al cambiar el destino, la etiqueta y el tipo lo siguen mientras sigan
  // siendo los que traía el destino anterior; si se personalizaron, se respetan.
  function cambiarCampoConDestino(campo: CampoEditable, patch: Partial<CampoEditable>) {
    if (patch.destino === undefined || patch.destino === campo.destino) {
      updateBuilderCampo(campo.id, patch)
      return
    }
    const destinos = proyecto.destinosDisponibles ?? []
    const nombreDe = (valor?: string) => {
      const destino = destinos.find((item) => item.valor === valor)
      return destino ? separarEtiquetaDestino(destino.etiqueta).nombre : ''
    }
    const next = { ...patch }
    const nombreNuevo = nombreDe(patch.destino)
    if (nombreNuevo && (!campo.etiqueta.trim() || campo.etiqueta === nombreDe(campo.destino))) {
      next.etiqueta = nombreNuevo
    }
    if (campo.tipo === tipoParaDestino(campo.destino ?? '')) {
      next.tipo = tipoParaDestino(patch.destino)
    }
    updateBuilderCampo(campo.id, next)
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

  // Los campos se reparten por su destino: lo que va a person se muestra junto
  // a los datos base del participante; el cuestionario y el bebé, en el filtro.
  // La API siempre publica la lista (vacía si el estudio no tiene qué pedir);
  // solo los mocks y una API vieja no la traen.
  const publicaDestinos = proyecto.destinosDisponibles !== undefined
  const destinosDemograficos = (proyecto.destinosDisponibles ?? []).filter(
    (destino) => destino.fuente === 'person',
  )
  const destinosDeFiltro = (proyecto.destinosDisponibles ?? []).filter(
    (destino) => destino.fuente !== 'person',
  )
  const esCampoDemografico = (campo: { destino?: string }) =>
    Boolean(campo.destino?.startsWith('participante.'))
  const camposDemograficos = (builder?.campos ?? []).filter(esCampoDemografico)
  const camposDeFiltro = (builder?.campos ?? []).filter((campo) => !esCampoDemografico(campo))
  // Lo mismo para quien registra: cada campo va en la sección de su destino.
  const demograficosAlRegistrar = proyecto.camposEspecificos.filter(esCampoDemografico)
  const filtroAlRegistrar = proyecto.camposEspecificos.filter((campo) => !esCampoDemografico(campo))

  // Cada destino guarda un solo dato: la API descarta el segundo campo que
  // apunte al mismo lugar, así que no se ofrece lo que ya está en uso.
  const destinosUsados = new Set(
    (builder?.campos ?? []).map((campo) => campo.destino).filter(Boolean),
  )
  const destinosLibresPara = (campo: CampoEditable, destinos: DestinoCampo[]) =>
    destinos.filter((destino) => destino.valor === campo.destino || !destinosUsados.has(destino.valor))

  const opcionesParticipante: OpcionAgregarCampo[] = [
    ...CAMPO_BASE_KEYS.filter(
      (key) => !(builder?.camposBase ?? []).some((campo) => campo.nombreCampo === key),
    ).map((key) => ({ id: `base:${key}`, etiqueta: etiquetaCampoBase(key), grupo: 'Datos base' })),
    ...destinosDemograficos
      .filter((destino) => !destinosUsados.has(destino.valor))
      .map((destino) => ({
        id: destino.valor,
        etiqueta: separarEtiquetaDestino(destino.etiqueta).nombre,
        grupo: 'Otros datos del participante',
      })),
  ]

  const opcionesFiltro: OpcionAgregarCampo[] = destinosDeFiltro
    .filter((destino) => !destinosUsados.has(destino.valor))
    .map((destino) => {
      const { grupo, nombre } = separarEtiquetaDestino(destino.etiqueta)
      return { id: destino.valor, etiqueta: nombre, grupo: grupo || 'Estudio' }
    })

  function agregarOpcion(opcion: OpcionAgregarCampo) {
    if (!builder) return
    if (opcion.id.startsWith('base:')) {
      restaurarCampoBase(opcion.id.slice('base:'.length) as CampoBaseKey)
      return
    }
    const campo = createEmptyCampo(builder.campos)
    builder.onChangeCampos([
      ...builder.campos,
      { ...campo, destino: opcion.id, etiqueta: opcion.etiqueta, tipo: tipoParaDestino(opcion.id) },
    ])
  }

  function restaurarCampoBase(key: CampoBaseKey) {
    if (!builder) return
    const orden = CAMPO_BASE_KEYS.indexOf(key)
    const next = [...builder.camposBase]
    const posicion = next.findIndex((campo) => CAMPO_BASE_KEYS.indexOf(campo.nombreCampo) > orden)
    next.splice(posicion < 0 ? next.length : posicion, 0, campoBaseEditable(key, proyecto.ciudadesPermitidas))
    builder.onChangeCamposBase(next)
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

  const filtroCount = canBuild ? camposDeFiltro.length : filtroAlRegistrar.length
  const showFiltroSection = canBuild || filtroCount > 0
  // El guardado del diseño corre en segundo plano. Deshabilitar los controles
  // mientras corre hacía titilar los botones y alternar el cursor entre pointer
  // y "bloqueado" en cada pulsación, así que solo lo indica el badge.

  const floatingBar = (
    <div className={styles.floatingBar} role="toolbar" aria-label="Acciones del registro">
      {!builder ? (
        <Button
          type="button"
          variant="secondary"
          className={styles.floatingBtn}
          disabled={loading}
          onClick={resetForm}
        >
          Descartar
        </Button>
      ) : null}
      {builder?.onSave ? (
        <Button
          type="button"
          variant="soft"
          className={styles.floatingBtn}
          loading={builder.saving}
          disabled={!builder.dirty}
          onClick={builder.onSave}
        >
          Guardar diseño
        </Button>
      ) : null}
      {/* Mientras la coordinadora diseña el formulario, esta pantalla no
          registra participantes: el botón solo aparece para quien va a
          capturar datos. */}
      {!builder ? (
        <Button
          type="button"
          className={styles.floatingBtn}
          loading={loading}
          onClick={() => formRef.current?.requestSubmit()}
        >
          Guardar
        </Button>
      ) : null}
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
    nombreCampo: 'nombre' | 'documento'
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
        inputMode={resolvedTipo === 'tel' || resolvedTipo === 'number' ? 'numeric' : undefined}
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
        return renderTelefonos(label, required)
    }
  }

  // Texto libre: a veces se anota el parentesco ("3001234567 (mamá)").
  function renderTelefonos(label: string, required: boolean) {
    return (
      <div className={styles.telefonos}>
        {telefonos.map((valor, index) => (
          <div key={index} className={styles.telefonoFila}>
            <Input
              label={index === 0 ? label : `${label} ${index + 1}`}
              name={`telefonos.${index}`}
              value={valor}
              onChange={(e) => updateTelefono(index, e.target.value)}
              error={errors[`telefonos.${index}`] ?? (index === 0 ? errors.telefonos : undefined)}
              icon={<IconPhone size={16} />}
              placeholder="Ej. 3001234567 (mamá)"
              maxLength={LARGO_MAXIMO_TELEFONO}
              required={required && index === 0}
            />
            {telefonos.length > 1 ? (
              <button
                type="button"
                className={`${styles.campoLabelEditBtn} ${styles.campoLabelDangerBtn} ${styles.telefonoQuitar}`}
                aria-label={`Quitar ${label.toLowerCase()} ${index + 1}`}
                title="Quitar"
                onClick={() => quitarTelefono(index)}
              >
                <IconTrash size={14} />
              </button>
            ) : null}
          </div>
        ))}
        {telefonos.length < MAXIMO_TELEFONOS ? (
          <button
            type="button"
            className={styles.telefonoAgregar}
            onClick={() => setTelefonos((prev) => [...prev, ''])}
          >
            <IconPlus size={14} />
            Agregar otro número
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section}>
        <SectionHeadEditor
          icon={<IconUser size={15} />}
          titulos={titulos.base}
          editable={canBuild}
          badge={
            <>
              {/* Siempre montado: montarlo y desmontarlo cambiaba la altura de la
                  página en cada autosave, y el scroll saltaba con ella. */}
              <span
                className={`${styles.dirtyBadge} ${
                  builder?.saving || builder?.dirty ? '' : styles.dirtyBadgeIdle
                }`}
                aria-hidden={!(builder?.saving || builder?.dirty)}
              >
                {builder?.saving ? 'Guardando…' : 'Cambios sin guardar'}
              </span>
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
          {/* Los seis campos base tienen su columna en person (nombre y documento
              no se pueden quitar); debajo van los demográficos extra. */}
          {canBuild ? (
            <AgregarCampoTile
              opciones={opcionesParticipante}
              subtitulo="Datos del participante"
              sinOpciones="Ya se piden todos los datos del participante"
              onElegir={agregarOpcion}
            />
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
                  requeridoFijo={isCampoBaseFijo(campo.nombreCampo)}
                  onRemove={
                    isCampoBaseFijo(campo.nombreCampo)
                      ? undefined
                      : () => removeBuilderCampoBase(campo.id)
                  }
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

          {/* Demográficos extra: viven en la misma lista que los específicos,
              pero se muestran aquí porque su destino es la tabla person. */}
          {canBuild && builder
            ? camposDemograficos.map((campo) => (
                <CampoFormTile
                  key={campo.id}
                  campo={campo}
                  destinos={destinosLibresPara(campo, destinosDemograficos)}
                  permitirSinDestino={false}
                  isDragging={dragId === campo.id}
                  isDropTarget={
                    dragGroup === 'extra' && dropId === campo.id && dragId !== campo.id
                  }
                  onDragStart={(event) => handleTileDragStart('extra', campo.id, event)}
                  onDragOver={(event) => handleTileDragOver('extra', campo.id, event)}
                  onDragLeave={() => setDropId((prev) => (prev === campo.id ? null : prev))}
                  onDrop={(event) => handleTileDrop('extra', campo.id, event)}
                  onDragEnd={clearDragState}
                  onChange={(patch) => cambiarCampoConDestino(campo, patch)}
                  onRemove={() => removeBuilderCampo(campo.id)}
                >
                  {renderExtraControl(campo)}
                </CampoFormTile>
              ))
            : demograficosAlRegistrar.map((campo) => (
                <div key={campo.nombreCampo}>{renderExtraControl(campo)}</div>
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
            badge={
              <span className={styles.badge}>
                {filtroCount} {filtroCount === 1 ? 'campo' : 'campos'}
              </span>
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
            {/* Sin lista de destinos (mocks, API vieja) se cae al campo libre. */}
            {canBuild && publicaDestinos ? (
              <AgregarCampoTile
                opciones={opcionesFiltro}
                subtitulo="Datos del estudio"
                sinOpciones={
                  destinosDeFiltro.length === 0
                    ? 'Este estudio no tiene datos propios para pedir'
                    : 'Ya se piden todos los datos del estudio'
                }
                onElegir={agregarOpcion}
              />
            ) : canBuild ? (
              <button
                type="button"
                className={styles.addCampoTile}
                onClick={() => addBuilderCampo()}
              >
                <IconPlus size={20} />
                <span>Agregar campo</span>
                <small>Se coloca al final</small>
              </button>
            ) : null}

            {canBuild && builder
              ? camposDeFiltro.map((campo) => (
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
                    onChange={(patch) => cambiarCampoConDestino(campo, patch)}
                    // Con destinos, la copia no tendría dónde guardarse.
                    onDuplicate={
                      publicaDestinos ? undefined : () => duplicateBuilderCampo(campo.id)
                    }
                    onRemove={() => removeBuilderCampo(campo.id)}
                    destinos={destinosLibresPara(campo, destinosDeFiltro)}
                  >
                    {renderExtraControl(campo)}
                  </CampoFormTile>
                ))
              : filtroAlRegistrar.map((campo) => (
                  <div key={campo.nombreCampo}>{renderExtraControl(campo)}</div>
                ))}
          </div>
        </section>
      ) : null}

      {success ? (
        <Toast tone="success" onClose={() => setSuccess('')}>
          {success}
        </Toast>
      ) : aviso ? (
        <Toast tone="info" duration={0} onClose={() => setAviso('')}>
          {aviso}
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
