import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@shared/ui/Button'
import { IconCheck, IconChevronDown, IconMapPin, IconPlus, IconClose } from '@shared/ui/icons'
import styles from './CiudadesMultiSelect.module.css'

export const CATALOGO_CIUDADES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Ibagué',
] as const

interface CiudadesMultiSelectProps {
  label?: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
}

export function CiudadesMultiSelect({
  label = 'Ciudades',
  value,
  onChange,
  error,
  disabled = false,
}: CiudadesMultiSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>()
  const [catalogo, setCatalogo] = useState<string[]>(() => [...CATALOGO_CIUDADES])
  const [nueva, setNueva] = useState('')
  const [addError, setAddError] = useState('')

  const opciones = useMemo(() => {
    const merged = new Set([...catalogo, ...value])
    return Array.from(merged).sort((a, b) => a.localeCompare(b, 'es'))
  }, [catalogo, value])

  function updateMenuPosition() {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const gap = 8
    const maxHeight = Math.min(20 * 16, window.innerHeight * 0.55)
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const openUp = spaceBelow < Math.min(maxHeight, 180) && rect.top > spaceBelow

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

  useEffect(() => {
    if (!open) return
    updateMenuPosition()

    function onReposition() {
      updateMenuPosition()
    }

    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

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

    let cleanup: (() => void) | undefined

    return () => {
      window.clearTimeout(timer)
      cleanup?.()
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  function toggleCiudad(ciudad: string) {
    if (value.includes(ciudad)) {
      onChange(value.filter((item) => item !== ciudad))
      return
    }
    onChange([...value, ciudad])
  }

  function removeCiudad(ciudad: string) {
    onChange(value.filter((item) => item !== ciudad))
  }

  function addCiudad() {
    const trimmed = nueva.trim()
    if (!trimmed) {
      setAddError('Escribe el nombre de la ciudad')
      return
    }

    const existing = opciones.find(
      (item) => item.localeCompare(trimmed, 'es', { sensitivity: 'accent' }) === 0,
    )
    const ciudad = existing ?? trimmed

    if (!existing) {
      setCatalogo((prev) => [...prev, ciudad])
    }
    if (!value.includes(ciudad)) {
      onChange([...value, ciudad])
    }
    setNueva('')
    setAddError('')
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
          aria-label={label}
        >
          <ul className={styles.options}>
            {opciones.map((ciudad) => {
              const selected = value.includes(ciudad)
              return (
                <li key={ciudad}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                    onClick={() => toggleCiudad(ciudad)}
                  >
                    <span className={styles.optionCheck} aria-hidden="true">
                      {selected ? <IconCheck size={14} /> : null}
                    </span>
                    <span>{ciudad}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              value={nueva}
              placeholder="Agregar ciudad…"
              aria-label="Nueva ciudad"
              onChange={(e) => {
                setAddError('')
                setNueva(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCiudad()
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="soft"
              icon={<IconPlus size={14} />}
              onClick={addCiudad}
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
    <div ref={rootRef} className={styles.field}>
      <span className={styles.label}>{label}</span>

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
        <span className={styles.triggerIcon} aria-hidden="true">
          <IconMapPin size={16} />
        </span>

        <span className={styles.triggerBody}>
          {value.length > 0 ? (
            <span className={styles.chips}>
              {value.map((ciudad) => (
                <span key={ciudad} className={styles.chip}>
                  {ciudad}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Quitar ${ciudad}`}
                    disabled={disabled}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      removeCiudad(ciudad)
                    }}
                  >
                    <IconClose size={12} />
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className={styles.placeholder}>Selecciona ciudades</span>
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
