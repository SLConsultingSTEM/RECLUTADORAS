import { useState, type ReactNode, type SyntheticEvent } from 'react'
import styles from './Accordion.module.css'

interface AccordionItemProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setOpen(event.currentTarget.open)
  }

  return (
    <details className={styles.item} open={open} onToggle={handleToggle}>
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  )
}

interface AccordionProps {
  children: ReactNode
}

export function Accordion({ children }: AccordionProps) {
  return <div className={styles.accordion}>{children}</div>
}
