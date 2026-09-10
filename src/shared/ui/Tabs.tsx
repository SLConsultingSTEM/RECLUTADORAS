import { useEffect, useState, type ReactNode } from 'react'
import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

interface TabsProps {
  items: TabItem[]
  active: string
  onChange: (id: string) => void
  label?: string
}

export function Tabs({ items, active, onChange, label = 'Vistas' }: TabsProps) {
  const [motionReady, setMotionReady] = useState(false)

  useEffect(() => {
    // Evita que el indicador “viaje” desde 0 al montar (p. ej. recarga en Registrar).
    const id = window.requestAnimationFrame(() => setMotionReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  return (
    <div
      className={`${styles.tabs} ${motionReady ? styles.tabsReady : ''}`}
      role="tablist"
      aria-label={label}
      style={{
        ['--tab-count' as string]: items.length,
        ['--tab-index' as string]: activeIndex,
      }}
    >
      <span className={styles.indicator} aria-hidden="true" />

      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === active}
          className={`${styles.tab} ${item.id === active ? styles.tabActive : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.icon ? <span className={styles.tabIcon}>{item.icon}</span> : null}
          <span>{item.label}</span>
          {typeof item.count === 'number' ? (
            <span className={styles.count}>{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
