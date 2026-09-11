import {
  startTransition,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@shared/ui/Button'
import { IconCheck, IconChevronDown, IconPlus, IconClose } from '@shared/ui/icons'
import styles from './CiudadesMultiSelect.module.css'

const EMPTY_CATALOG: string[] = []

function sameList(a: string[], b: string[]) {
  if (a === b) return true
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

export interface OpcionesMultiSelectProps {
  label?: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
  placeholder?: string
  addPlaceholder?: string
  icon?: ReactNode
  /** Catálogo inicial (p. ej. ciudades sugeridas). Las del value siempre se muestran. */
  catalog?: string[]
  /** Si es true, no deja dejar la lista vacía. */
  requireOne?: boolean
  compact?: boolean
}

export function OpcionesMultiSelect({
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Selecciona opciones',
  addPlaceholder = 'Agregar opción…',
  icon,
  catalog = EMPTY_CATALOG,
  requireOne = false,
  compact = false,
}: OpcionesMultiSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)
  const openUpRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>()
  const [extraCatalog, setExtraCatalog] = useState<string[]>([])
  const [nueva, setNueva] = useState('')
  const [addError, setAddError] = useState('')
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (!sameList(value, localValue)) {
      setLocalValue(value)
    }
    // Sync solo cuando el padre cambia el valor (p. ej. Descartar / autosave).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- localValue es la fuente al editar
  }, [value])

  const opciones = useMemo(() => {
    const merged = new Set([...catalog, ...extraCatalog, ...localValue])
    return Array.from(merged).sort((a, b) => a.localeCompare(b, 'es'))
  }, [catalog, extraCatalog, localValue])

  function commit(next: string[]) {
    setLocalValue(next)
    startTransition(() => {
      onChange(next)
    })
  }

  function updateMenuPosition(lockDirection = false) {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const gap = 8
    const maxHeight = Math.min(20 * 16, window.innerHeight * 0.55)

    if (lockDirection || !open) {
      const spaceBelow = window.innerHeight - rect.bottom - gap
      openUpRef.current =
        spaceBelow < Math.min(maxHeight, 180) && rect.top > spaceBelow
    }

    const openUp = openUpRef.current
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 280),
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      maxHeight,
      zIndex: 1200,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    // Fija dirección al abrir; no recalcula al agregar chips (evita saltos).
    updateMenuPosition(true)
  }, [open])

  useEffect(() => {
    if (!open) return

    function onReposition() {
      updateMenuPosition(false)
    }

    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    let cleanup: (() => void) | undefined
    const timer = window.setTimeout(() => {
      function onPointerDown(event: PointerEvent) {
        const path = event.composedPath()
        if (rootRef.current && path.includes(rootRef.current)) return
        if (menuRef.current && path.includes(menuRef.current)) return
        setOpen(false)
      }

      function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false)
      }

      document.addEventListener('pointerdown', onPointerDown, true)
      document.addEventListener('keydown', onKeyDown)
      cleanup = () => {
        document.removeEventListener('pointerdown', onPointerDown, true)
        document.removeEventListener('keydown', onKeyDown)
      }
    }, 0)

    return () => {
      window.clearTimeout(timer)
      cleanup?.()
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  function toggleOpcion(opcion: string) {
    if (localValue.includes(opcion)) {
      if (requireOne && localValue.length <= 1) return
      commit(localValue.filter((item) => item !== opcion))
      return
    }
    commit([...localValue, opcion])
  }

  function removeOpcion(opcion: string) {
    if (requireOne && localValue.length <= 1) return
    commit(localValue.filter((item) => item !== opcion))
  }

  function addOpcion() {
    const trimmed = nueva.trim()
    if (!trimmed) {
      setAddError('Escribe una opción')
      return
    }

    const existing = opciones.find(
      (item) => item.localeCompare(trimmed, 'es', { sensitivity: 'accent' }) === 0,
    )
    const opcion = existing ?? trimmed

    if (!existing) {
      setExtraCatalog((prev) => [...prev, opcion])
    }
    if (!localValue.includes(opcion)) {
      commit([...localValue, opcion])
    }
    setNueva('')
    setAddError('')
    requestAnimationFrame(() => {
      addInputRef.current?.focus()
    })
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          id={listId}
          className={styles.menu}
          style={menuStyle}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label ?? 'Opciones'}
          onMouseDown={(event) => {
            // Evita que el trigger/padre robe el foco del input al hacer clic en el menú.
            event.stopPropagation()
          }}
        >
          <ul className={styles.options}>
            {opciones.map((opcion) => {
              const selected = localValue.includes(opcion)
              const locked = selected && requireOne && localValue.length <= 1
              return (
                <li key={opcion}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                    disabled={locked}
                    onClick={() => toggleOpcion(opcion)}
                  >
                    <span className={styles.optionCheck} aria-hidden="true">
                      {selected ? <IconCheck size={14} /> : null}
                    </span>
                    <span>{opcion}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className={styles.addRow}>
            <input
              ref={addInputRef}
              className={styles.addInput}
              value={nueva}
              placeholder={addPlaceholder}
              aria-label="Nueva opción"
              onChange={(e) => {
                setAddError('')
                setNueva(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOpcion()
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="soft"
              icon={<IconPlus size={14} />}
              onClick={addOpcion}
            >
              Agregar
            </Button>
          </div>
          {addError ? <p className={styles.addError}>{addError}</p> : null}
        </div>,
        document.body,
      )
    : null

  return (
    <div
      ref={rootRef}
      className={`${styles.field} ${compact ? styles.fieldCompact : ''}`}
    >
      {label ? <span className={styles.label}>{label}</span> : null}

      <div
        ref={triggerRef}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''} ${
          error ? styles.triggerInvalid : ''
        } ${disabled ? styles.triggerDisabled : ''}`}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((prev) => !prev)
          }
        }}
      >
        {icon ? (
          <span className={styles.triggerIcon} aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <span className={styles.triggerBody}>
          {localValue.length > 0 ? (
            <span className={styles.chips}>
              {localValue.map((opcion) => (
                <span key={opcion} className={styles.chip} title={opcion}>
                  <span className={styles.chipLabel}>{opcion}</span>
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Quitar ${opcion}`}
                    disabled={disabled || (requireOne && localValue.length <= 1)}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      removeOpcion(opcion)
                    }}
                  >
                    <IconClose size={12} />
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </span>

        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`} aria-hidden="true">
          <IconChevronDown size={16} />
        </span>
      </div>

      {menu}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  )
}
