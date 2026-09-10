import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './Field.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  endAdornment?: ReactNode
  /** Label dentro del campo: actúa como placeholder y sube al enfocar/escribir. */
  floating?: boolean
  /** Estado visual de éxito (borde/label en verde). */
  valid?: boolean
}

function hasInputValue(value: InputHTMLAttributes<HTMLInputElement>['value']) {
  if (value == null) return false
  return String(value).length > 0
}

export function Input({
  label,
  id,
  error,
  hint,
  icon,
  endAdornment,
  floating = false,
  valid = false,
  className = '',
  onAnimationStart,
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name ?? label
  const useFloating = Boolean(floating && label)
  const inputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(rest.onChange)
  const valueRef = useRef(rest.value)
  const [autofillRaised, setAutofillRaised] = useState(false)
  const [hasSeenValue, setHasSeenValue] = useState(false)

  useEffect(() => {
    onChangeRef.current = rest.onChange
    valueRef.current = rest.value
  })

  const valueFilled = hasInputValue(rest.value)
  if (valueFilled && !hasSeenValue) {
    setHasSeenValue(true)
  }
  if (!valueFilled && autofillRaised && hasSeenValue) {
    setAutofillRaised(false)
  }

  const floated =
    useFloating && (valueFilled || Boolean(error) || valid || (autofillRaised && !hasSeenValue))

  useEffect(() => {
    if (!useFloating) return

    const el = inputRef.current
    if (!el) return

    const syncAutofill = () => {
      try {
        const filled = el.value.length > 0 || el.matches(':-webkit-autofill')
        if (!filled) return
        setAutofillRaised(true)
        const onChange = onChangeRef.current
        if (el.value.length > 0 && onChange && !hasInputValue(valueRef.current)) {
          onChange({
            ...new Event('change', { bubbles: true }),
            target: el,
            currentTarget: el,
          } as unknown as ChangeEvent<HTMLInputElement>)
        }
      } catch {
        if (el.value.length > 0) setAutofillRaised(true)
      }
    }

    syncAutofill()
    const t1 = window.setTimeout(syncAutofill, 50)
    const t2 = window.setTimeout(syncAutofill, 300)
    const t3 = window.setTimeout(syncAutofill, 800)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [useFloating])

  function handleAnimationStart(event: AnimationEvent<HTMLInputElement>) {
    if (event.animationName === 'onAutoFillStart') {
      setAutofillRaised(true)
    }
    onAnimationStart?.(event)
  }

  const control = (
    <div
      className={`${styles.controlWrap} ${useFloating ? styles.floatingWrap : ''} ${
        floated ? styles.floatingActive : ''
      } ${error ? styles.hasError : ''} ${valid && !error ? styles.hasValid : ''}`}
    >
      {icon ? <span className={styles.adornment}>{icon}</span> : null}
      <input
        ref={inputRef}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`${styles.control} ${useFloating ? styles.floatingControl : ''} ${
          floated ? styles.isFloated : ''
        } ${icon ? styles.withAdornment : ''} ${endAdornment ? styles.withEndAdornment : ''} ${
          error ? styles.invalid : ''
        } ${valid && !error ? styles.valid : ''} ${className}`}
        {...rest}
        placeholder={useFloating ? ' ' : rest.placeholder}
        onAnimationStart={handleAnimationStart}
      />
      {useFloating ? (
        <span className={`${styles.floatingLabel} ${icon ? styles.floatingLabelWithIcon : ''}`}>
          {error || label}
          {!error && rest.required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}
      {endAdornment ? <span className={styles.endAdornment}>{endAdornment}</span> : null}
    </div>
  )

  return (
    <label
      className={`${styles.field} ${useFloating ? styles.fieldFloating : ''} ${
        error ? styles.fieldError : ''
      } ${valid && !error ? styles.fieldValid : ''}`}
      htmlFor={inputId}
    >
      {!useFloating && label ? (
        <span className={styles.label}>
          {label}
          {rest.required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}
      {control}
      {!useFloating ? (
        <span className={styles.message}>
          {error ? <span className={styles.error}>{error}</span> : null}
          {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>
      ) : null}
    </label>
  )
}
