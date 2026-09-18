import { useEffect, useRef, useState, type DragEvent, type MouseEvent, type ReactNode } from 'react'
import {
  CAMPO_TIPO_OPTIONS,
  type CampoEditable,
} from '@modules/proyectos/application/camposEspecificosHelpers'
import type { CampoTipo, DestinoCampo } from '@modules/proyectos/domain/types'
import { OpcionesMultiSelect } from '@modules/proyectos/presentation/OpcionesMultiSelect'
import { Button } from '@shared/ui/Button'
import { useConfirmDialog } from '@shared/ui/ConfirmDialog'
import {
  IconCopy,
  IconGrip,
  IconPencil,
  IconClose,
  IconTrash,
} from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

export type CampoTileModel = {
  id: string
  etiqueta: string
  tipo?: CampoTipo
  opciones?: string[]
  requerido?: boolean
  /** Si es un campo base de texto (nombre/documento/teléfono), permite text/number/date. */
  baseInput?: boolean
  /** Campo base de lista (género, documento, ciudad): permite editar opciones. */
  baseSelect?: boolean
  /** Semilla si el campo aún no tiene opciones persistidas. */
  defaultOpciones?: string[]
  /** Dónde se guarda el dato en la base. */
  destino?: string
}

interface CampoFormTileProps {
  campo: CampoTileModel
  children: ReactNode
  disabled?: boolean
  /** Si es true, el tipo de input está limitado (campos base fijos). */
  locked?: boolean
  isDragging?: boolean
  isDropTarget?: boolean
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onChange: (patch: Partial<CampoEditable>) => void
  onDuplicate?: () => void
  onRemove?: () => void
  /** Destinos que admite el estudio; sin esto no se ofrece el selector. */
  destinos?: DestinoCampo[]
}

function captureCampoSnapshot(campo: CampoTileModel) {
  return {
    etiqueta: campo.etiqueta,
    tipo: campo.tipo,
    opciones: campo.opciones ? [...campo.opciones] : undefined,
    requerido: campo.requerido,
  }
}

type CampoSnapshot = ReturnType<typeof captureCampoSnapshot>

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'input, select, textarea, button, a, [role="switch"], [role="combobox"], [role="listbox"], [contenteditable="true"]',
    ),
  )
}

export function CampoFormTile({
  campo,
  children,
  disabled = false,
  locked = false,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onChange,
  onDuplicate,
  onRemove,
  destinos,
}: CampoFormTileProps) {
  const startsEditing = !campo.etiqueta.trim()
  const [editing, setEditing] = useState(startsEditing)
  const blockDragRef = useRef(false)
  const etiquetaInputRef = useRef<HTMLInputElement>(null)
  const tileRef = useRef<HTMLDivElement>(null)
  const snapshotRef = useRef<CampoSnapshot | null>(
    startsEditing ? captureCampoSnapshot(campo) : null,
  )
  const { confirm, dialog: confirmDialog } = useConfirmDialog()
  const canDrag = !disabled && !editing
  const showToolbar = Boolean(onDuplicate || onRemove)
  const tipoOptions = locked
    ? campo.baseInput
      ? CAMPO_TIPO_OPTIONS.filter((option) => option.value !== 'select')
      : []
    : CAMPO_TIPO_OPTIONS
  const canChangeTipo = tipoOptions.length > 0
  const canEditOpciones = campo.tipo === 'select' || Boolean(campo.baseSelect)

  async function requestRemove() {
    if (!onRemove) return
    const label = campo.etiqueta.trim() || 'este campo'
    const ok = await confirm({
      title: '¿Eliminar este campo?',
      message: 'Vas a eliminar',
      subject: label,
      confirmLabel: 'Sí, eliminar',
    })
    if (!ok) return
    onRemove()
  }
  const opciones =
    campo.opciones?.length
      ? campo.opciones
      : canEditOpciones && campo.defaultOpciones?.length
        ? campo.defaultOpciones
        : (campo.opciones ?? [])

  function openEditing() {
    snapshotRef.current = captureCampoSnapshot({
      ...campo,
      opciones: campo.opciones?.length ? [...campo.opciones] : [...opciones],
    })
    setEditing(true)
  }

  useEffect(() => {
    if (!editing || !canEditOpciones) return
    if (campo.opciones?.length) return
    const seed = campo.defaultOpciones?.length
      ? [...campo.defaultOpciones]
      : ['']
    onChange({ opciones: seed.filter(Boolean).length ? seed : ['Opción 1'] })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- evitar bucles con onChange
  }, [editing, canEditOpciones, campo.opciones, campo.defaultOpciones])

  // autoFocus desplazaba la página hasta el campo recién agregado. Ahora se
  // enfoca sin mover el scroll y, si el campo quedó fuera de la vista, se
  // acerca una sola vez: en StrictMode el efecto corre dos veces y, sin el
  // guard ni el frame de espera, el tile se desplazaba antes de tener su
  // posición final y la página saltaba arriba y abajo.
  const yaDesplazadoRef = useRef(false)

  useEffect(() => {
    if (!editing) {
      yaDesplazadoRef.current = false
      return
    }

    etiquetaInputRef.current?.focus({ preventScroll: true })

    if (yaDesplazadoRef.current) return
    yaDesplazadoRef.current = true

    const frame = window.requestAnimationFrame(() => {
      const tile = tileRef.current
      if (!tile) return

      const { top, bottom } = tile.getBoundingClientRect()
      if (top >= 0 && bottom <= window.innerHeight) return

      tile.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'nearest',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [editing])

  function saveEditing() {
    snapshotRef.current = null
    setEditing(false)
  }

  function discardEditing() {
    const snapshot = snapshotRef.current
    if (snapshot) {
      onChange({
        etiqueta: snapshot.etiqueta,
        tipo: snapshot.tipo,
        opciones: snapshot.opciones,
        requerido: snapshot.requerido,
      })
    }
    snapshotRef.current = null
    setEditing(false)
  }

  function updateTipo(tipo: CampoTipo) {
    if (!canChangeTipo) return
    if (locked && campo.baseInput && tipo === 'select') return
    if (tipo === 'select') {
      onChange({
        tipo,
        opciones: campo.opciones?.length
          ? campo.opciones
          : campo.defaultOpciones?.length
            ? [...campo.defaultOpciones]
            : ['Opción 1'],
      })
      return
    }
    onChange({ tipo, opciones: undefined })
  }

  function handleMouseDown(event: MouseEvent<HTMLElement>) {
    blockDragRef.current = isInteractiveTarget(event.target)
  }

  function handleDragStart(event: DragEvent<HTMLElement>) {
    if (!canDrag || blockDragRef.current) {
      event.preventDefault()
      return
    }
    onDragStart(event)
  }

  return (
    <div
      ref={tileRef}
      className={`${styles.campoTile} ${canDrag ? styles.campoTileDraggable : ''} ${
        editing ? styles.campoTileEditing : ''
      } ${isDragging ? styles.campoTileDragging : ''} ${
        isDropTarget ? styles.campoTileDrop : ''
      }`}
      draggable={canDrag}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      title={canDrag ? 'Arrastra para reordenar' : undefined}
    >
      {canDrag ? (
        <span className={styles.campoDragHint} aria-hidden="true" title="Arrastra para reordenar">
          <IconGrip size={14} />
        </span>
      ) : null}

      <div className={styles.campoTileBody}>
      {!editing ? (
        <div
          className={`${styles.campoTileToolbar} ${showToolbar ? styles.campoTileToolbarWide : ''}`}
          role="toolbar"
          aria-label="Acciones del campo"
        >
          <button
            type="button"
            className={styles.campoLabelEditBtn}
            disabled={disabled}
            aria-label="Editar campo"
            title="Editar campo"
            onClick={openEditing}
          >
            <IconPencil size={14} />
          </button>
          {showToolbar ? (
            <>
              <button
                type="button"
                className={styles.campoLabelEditBtn}
                disabled={disabled}
                aria-label="Duplicar a la derecha"
                title="Duplicar"
                onClick={onDuplicate}
              >
                <IconCopy size={14} />
              </button>
              <button
                type="button"
                className={`${styles.campoLabelEditBtn} ${styles.campoLabelDangerBtn}`}
                disabled={disabled}
                aria-label="Eliminar campo"
                title="Eliminar"
                onClick={() => void requestRemove()}
              >
                <IconTrash size={14} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div className={styles.campoTilePreview}>
        {editing ? (
          <div className={styles.campoEditMeta}>
            <div className={styles.campoMetaBlock}>
              <div className={styles.campoMetaLabelRow}>
                <span className={styles.campoMetaLabel}>Etiqueta del campo</span>
                <button
                  type="button"
                  className={styles.campoCloseBtn}
                  disabled={disabled}
                  aria-label="Cerrar edición del campo"
                  title="Cerrar"
                  onClick={saveEditing}
                >
                  <IconClose size={14} />
                </button>
              </div>
              <div className={styles.campoLabelRow}>
                <input
                  type="text"
                  className={styles.campoLabelInput}
                  value={campo.etiqueta}
                  disabled={disabled}
                  placeholder="Ej. Nombre completo"
                  ref={etiquetaInputRef}
                  aria-label="Etiqueta del campo"
                  onChange={(e) => onChange({ etiqueta: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      saveEditing()
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      discardEditing()
                    }
                  }}
                />
                {showToolbar ? (
                  <div
                    className={styles.campoLabelActions}
                    role="toolbar"
                    aria-label="Acciones del campo"
                  >
                    <button
                      type="button"
                      className={styles.campoLabelEditBtn}
                      disabled={disabled}
                      aria-label="Duplicar a la derecha"
                      title="Duplicar"
                      onClick={onDuplicate}
                    >
                      <IconCopy size={15} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.campoLabelEditBtn} ${styles.campoLabelDangerBtn}`}
                      disabled={disabled}
                      aria-label="Eliminar campo"
                      title="Eliminar"
                      onClick={() => void requestRemove()}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            {destinos && destinos.length > 0 ? (
              <div className={styles.campoTipoRow}>
                <span className={styles.campoMetaLabel}>Se guarda en</span>
                <select
                  className={styles.campoDestinoSelect}
                  value={campo.destino ?? ''}
                  disabled={disabled}
                  aria-label="Dónde se guarda el dato"
                  onChange={(event) => onChange({ destino: event.target.value })}
                >
                  <option value="">Sin destino (no se guarda)</option>
                  {destinos.map((destino) => (
                    <option key={destino.valor} value={destino.valor}>
                      {destino.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {canChangeTipo ? (
              <div className={styles.campoTipoRow}>
                <span className={styles.campoMetaLabel}>Tipo de input</span>
                <div className={styles.campoSegmented} role="group" aria-label="Tipo de campo">
                  {tipoOptions.map((option) => {
                    const active = (campo.tipo ?? 'text') === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.campoSegment} ${
                          active ? styles.campoSegmentActive : ''
                        }`}
                        disabled={disabled}
                        aria-pressed={active}
                        onClick={() => updateTipo(option.value)}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          key={campo.tipo ?? 'text'}
          className={`${styles.campoControlSwap} ${editing ? styles.campoControlOnly : ''}`}
        >
          {children}
        </div>

        {editing && canEditOpciones ? (
          <div className={styles.campoOptions}>
            <OpcionesMultiSelect
              label="Opciones"
              value={opciones.filter(Boolean)}
              catalog={campo.defaultOpciones ?? []}
              placeholder="Agrega opciones de la lista"
              addPlaceholder="Nueva opción…"
              disabled={disabled}
              requireOne
              compact
              onChange={(next) => onChange({ opciones: next })}
            />
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className={styles.campoEditPanel}>
          <div className={styles.campoRequiredRow}>
            <div>
              <span className={styles.campoRequiredTitle}>Obligatorio</span>
              <p className={styles.campoRequiredHint}>Debe completarse al registrar</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(campo.requerido)}
              className={`${styles.campoSwitch} ${campo.requerido ? styles.campoSwitchOn : ''}`}
              disabled={disabled}
              onClick={() => onChange({ requerido: !campo.requerido })}
            >
              <span className={styles.campoSwitchThumb} />
            </button>
          </div>

          <div className={styles.campoEditFooter}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={discardEditing}
            >
              Descartar
            </Button>
            <Button
              type="button"
              variant="soft"
              size="sm"
              disabled={disabled}
              onClick={saveEditing}
            >
              Guardar
            </Button>
          </div>
        </div>
      ) : null}
      </div>
      {confirmDialog}
    </div>
  )
}
