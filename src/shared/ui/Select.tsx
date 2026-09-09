import type { ReactNode, SelectHTMLAttributes } from 'react'
import { IconChevronDown } from './icons'
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
}

export function Select({
  label,
  id,
  options,
  error,
  hint,
  icon,
  className = '',
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name ?? label

  return (
    <label className={styles.field} htmlFor={selectId}>
      {label ? (
        <span className={styles.label}>
          {label}
          {rest.required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}

      <div className={styles.controlWrap}>
        {icon ? <span className={styles.adornment}>{icon}</span> : null}
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`${styles.control} ${styles.select} ${icon ? styles.withAdornment : ''} ${
            error ? styles.invalid : ''
          } ${className}`}
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

      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}
