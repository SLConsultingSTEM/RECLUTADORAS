import type { ReactNode } from 'react'
import styles from './Table.module.css'

interface TableProps {
  headers: string[]
  children: ReactNode
  caption?: string
}

export function Table({ headers, children, caption }: TableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
