import type { TextareaHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({
  label,
  id,
  error,
  hint,
  className = '',
  rows = 3,
  ...rest
}: TextareaProps) {
  const inputId = id ?? rest.name ?? label

  return (
    <label
      className={`${styles.field} ${error ? styles.fieldError : ''}`}
      htmlFor={inputId}
    >
      {label ? (
        <span className={styles.label}>
          {label}
          {rest.required ? <span className={styles.required}>*</span> : null}
        </span>
      ) : null}
      <div className={`${styles.controlWrap} ${error ? styles.hasError : ''}`}>
        <textarea
          id={inputId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={`${styles.control} ${styles.textarea} ${error ? styles.invalid : ''} ${className}`}
          {...rest}
        />
      </div>
      <span className={styles.message}>
        {error ? <span className={styles.error}>{error}</span> : null}
        {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
      </span>
    </label>
  )
}
