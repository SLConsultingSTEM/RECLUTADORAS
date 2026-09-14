import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { IconCheck, IconChevronDown } from './icons'
import styles from './Field.module.css'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
  error?: string
  hint?: string
  icon?: ReactNode
  variant?: 'default' | 'toolbar' | 'pills'
  /** En variante pills: muestra el label visible (por defecto solo accesible). */
  showLabel?: boolean
}

export function Select({
  label,
  id,
  options,
  error,
  hint,
  icon,
  variant = 'default',
  showLabel = false,
  className = '',
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name ?? label
  const isToolbar = variant === 'toolbar'
  const isPills = variant === 'pills'

  if (isPills) {
    return (
      <PillsSelect
        label={label}
        id={String(selectId)}
        options={options}
        error={error}
        hint={hint}
        icon={icon}
        showLabel={showLabel}
        className={className}
        {...rest}
      />
    )
  }

  return (
    <label
      className={`${styles.field} ${isToolbar ? styles.fieldToolbar : ''}`}
      htmlFor={selectId}
    >
      {label ? (
        <span className={`${styles.label} ${isToolbar ? styles.labelToolbar : ''}`}>
          {label}
          {rest.required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}

      <div className={`${styles.controlWrap} ${isToolbar ? styles.controlWrapToolbar : ''}`}>
        {icon ? <span className={styles.adornment}>{icon}</span> : null}
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`${styles.control} ${styles.select} ${icon ? styles.withAdornment : ''} ${
            error ? styles.invalid : ''
          } ${isToolbar ? styles.controlToolbar : ''} ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow}>
          <IconChevronDown size={16} />
        </span>
      </div>

      <span className={styles.message}>
        {error ? <span className={styles.error}>{error}</span> : null}
        {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
      </span>
    </label>
  )
}

function PillsSelect({
  label,
  id,
  options,
  error,
  hint,
  icon,
  showLabel = false,
  className = '',
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  required,
}: SelectProps & { id: string }) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>()
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? options[0]?.value ?? ''))
  const currentValue = String(isControlled ? value : internalValue)
  const selected = options.find((option) => option.value === currentValue) ?? options[0]

  function updateMenuPosition() {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const gap = 8
    const maxHeight = Math.min(18 * 16, window.innerHeight * 0.5)
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const openUp = spaceBelow < Math.min(maxHeight, 160) && rect.top > spaceBelow

    setMenuStyle({
      position: 'fixed',
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.min(rect.width, window.innerWidth - 16),
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      maxHeight,
      zIndex: 1200,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateMenuPosition()
  }, [open, options.length])

  useEffect(() => {
    if (!open) return

    function onReposition() {
      updateMenuPosition()
    }

    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    // Evita que el mismo clic que abre cierre el menú al registrar el listener.
    const timer = window.setTimeout(() => {
      function onPointerDown(event: PointerEvent) {
        const path = event.composedPath()
        const root = rootRef.current
        const menu = menuRef.current
        if (root && path.includes(root)) return
        if (menu && path.includes(menu)) return
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

  function commit(next: string) {
    if (!isControlled) setInternalValue(next)
    onChange?.({
      target: { value: next, name: name ?? '' },
      currentTarget: { value: next, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>)
    setOpen(false)
  }

  function toggleOpen(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    setOpen((prev) => !prev)
  }

  const menu = open
    ? createPortal(
        <ul
          ref={menuRef}
          id={listId}
          className={styles.pillsMenu}
          role="listbox"
          aria-label={label ?? 'Opciones'}
          style={menuStyle}
        >
          {options.map((option) => {
            const active = option.value === currentValue
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.pillsOption} ${active ? styles.pillsOptionActive : ''}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    commit(option.value)
                  }}
                >
                  <span className={styles.pillsOptionLabel}>{option.label}</span>
                  {active ? (
                    <span className={styles.pillsOptionCheck} aria-hidden>
                      <IconCheck size={15} />
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>,
        document.body,
      )
    : null

  return (
    <div
      ref={rootRef}
      className={`${styles.field} ${styles.fieldToolbar} ${styles.fieldPills} ${
        showLabel ? styles.fieldPillsLabeled : ''
      } ${className}`}
    >
      {label ? (
        <span className={`${styles.label} ${showLabel ? styles.labelPillsVisible : styles.labelPills}`}>
          {label}
          {required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}

      {name ? <input type="hidden" name={name} value={currentValue} required={required} /> : null}

      <div
        ref={triggerRef}
        className={`${styles.controlWrap} ${styles.controlWrapPills} ${
          open ? styles.controlWrapPillsOpen : ''
        }`}
      >
        {icon ? <span className={styles.adornment}>{icon}</span> : null}
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          className={`${styles.control} ${styles.controlPills} ${icon ? styles.withAdornment : ''} ${
            error ? styles.invalid : ''
          }`}
          onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onClick={toggleOpen}
        >
          <span className={styles.pillsValue}>{selected?.label ?? 'Seleccione…'}</span>
        </button>
        <span className={`${styles.selectArrow} ${open ? styles.selectArrowOpen : ''}`} aria-hidden>
          <IconChevronDown size={16} />
        </span>
      </div>

      {menu}

      {error || hint ? (
        <span className={styles.message}>
          {error ? <span className={styles.error}>{error}</span> : null}
          {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>
      ) : null}
    </div>
  )
}
