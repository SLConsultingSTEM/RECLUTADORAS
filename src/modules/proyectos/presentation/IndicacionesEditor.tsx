import { useEffect, useState } from 'react'
import {
  createEmptyIndicacion,
  type IndicacionEditable,
} from '@modules/proyectos/application/indicacionesMapper'
import { Button, IconButton } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState'
import {
  IconChevronLeft,
  IconChevronRight,
  IconListChecks,
  IconPlus,
  IconTrash,
} from '@shared/ui/icons'
import styles from './ProyectoInfo.module.css'

const REGLAS_POR_PAGINA = 5

interface IndicacionesEditorProps {
  items: IndicacionEditable[]
  onChange: (items: IndicacionEditable[]) => void
  disabled?: boolean
}

function getGroupRange(items: IndicacionEditable[], index: number) {
  const lead = items[index]?.lead ?? ''
  let start = index
  while (start > 0 && items[start - 1]?.lead === lead) start -= 1
  let end = index
  while (end < items.length - 1 && items[end + 1]?.lead === lead) end += 1
  return { start, end, lead }
}

export function IndicacionesEditor({
  items,
  onChange,
  disabled = false,
}: IndicacionesEditorProps) {
  const totalPaginas = Math.max(1, Math.ceil(items.length / REGLAS_POR_PAGINA))
  const [pagina, setPagina] = useState(0)

  useEffect(() => {
    if (pagina > totalPaginas - 1) setPagina(Math.max(0, totalPaginas - 1))
  }, [pagina, totalPaginas])

  const inicio = pagina * REGLAS_POR_PAGINA
  const visibles = items.slice(inicio, inicio + REGLAS_POR_PAGINA)
  const puedeAnterior = pagina > 0
  const puedeSiguiente = pagina < totalPaginas - 1

  function updateItem(id: string, patch: Partial<IndicacionEditable>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function updateGroupLead(index: number, nextLead: string) {
    const { start, end } = getGroupRange(items, index)
    onChange(
      items.map((item, i) =>
        i >= start && i <= end ? { ...item, lead: nextLead } : item,
      ),
    )
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function addItem() {
    const lastLead = items[items.length - 1]?.lead ?? ''
    const next = [...items, createEmptyIndicacion(lastLead)]
    onChange(next)
    setPagina(Math.floor((next.length - 1) / REGLAS_POR_PAGINA))
  }

  function addSection() {
    const next = [
      ...items,
      createEmptyIndicacion('Tener en cuenta que:'),
    ]
    onChange(next)
    setPagina(Math.floor((next.length - 1) / REGLAS_POR_PAGINA))
  }

  return (
    <section className={`${styles.contentBlock} ${styles.indicaciones}`}>
      <header className={styles.editorHeading}>
        <div className={styles.editorHeadingTop}>
          <div className={styles.editorHeadingLead}>
            <span className={styles.panelLabel}>Indicaciones</span>

            {totalPaginas > 1 ? (
              <div className={styles.pagerControls}>
                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Reglas anteriores"
                  disabled={!puedeAnterior || disabled}
                  onClick={() => setPagina((value) => Math.max(0, value - 1))}
                >
                  <IconChevronLeft size={18} />
                </button>

                <div className={styles.pagerDots} role="tablist" aria-label="Páginas de indicaciones">
                  {Array.from({ length: totalPaginas }, (_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      role="tab"
                      aria-label={`Ir a la página ${index + 1}`}
                      aria-selected={index === pagina}
                      disabled={disabled}
                      className={`${styles.pagerDot} ${index === pagina ? styles.pagerDotActive : ''}`}
                      onClick={() => setPagina(index)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Siguientes reglas"
                  disabled={!puedeSiguiente || disabled}
                  onClick={() => setPagina((value) => Math.min(totalPaginas - 1, value + 1))}
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles.editorHeaderActions}>
            <Button
              type="button"
              variant="secondary"
              className={styles.editorActionBtn}
              icon={<IconPlus size={18} />}
              disabled={disabled}
              onClick={addSection}
            >
              Agregar sección
            </Button>
            <Button
              type="button"
              variant="soft"
              className={styles.editorActionBtn}
              icon={<IconPlus size={18} />}
              disabled={disabled}
              onClick={addItem}
            >
              Agregar indicación
            </Button>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={`${styles.content} ${styles.contentReadable}`}>
          <EmptyState
            icon={<IconListChecks size={22} />}
            title="Sin indicaciones"
            description="Agrega una sección o una regla para este proyecto."
            action={
              <div className={styles.editorHeaderActions}>
                <Button
                  type="button"
                  variant="secondary"
                  className={styles.editorActionBtn}
                  icon={<IconPlus size={18} />}
                  disabled={disabled}
                  onClick={addSection}
                >
                  Agregar sección
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  className={styles.editorActionBtn}
                  icon={<IconPlus size={18} />}
                  disabled={disabled}
                  onClick={addItem}
                >
                  Agregar indicación
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <ol className={styles.editorList}>
          {visibles.map((item, index) => {
            const absoluteIndex = inicio + index
            const numero = absoluteIndex + 1
            const previousLead = absoluteIndex > 0 ? items[absoluteIndex - 1]?.lead : undefined
            const showSection = previousLead === undefined || previousLead !== item.lead

            return (
              <li key={item.id} className={styles.editorGroup}>
                {showSection ? (
                  <label className={`${styles.editorField} ${styles.editorSectionField}`}>
                    <span>Título de sección</span>
                    <input
                      type="text"
                      value={item.lead}
                      disabled={disabled}
                      placeholder="Ej. Tener en cuenta que:"
                      onChange={(e) => updateGroupLead(absoluteIndex, e.target.value)}
                    />
                  </label>
                ) : null}

                <div className={styles.editorItem}>
                  <div className={styles.editorItemHead}>
                    <strong className={styles.indicacionNum}>{numero}.</strong>
                    <IconButton
                      type="button"
                      label="Eliminar indicación"
                      variant="plain"
                      disabled={disabled}
                      onClick={() => removeItem(item.id)}
                    >
                      <IconTrash size={18} />
                    </IconButton>
                  </div>

                  <label className={styles.editorField}>
                    <span>Indicación</span>
                    <textarea
                      value={item.texto}
                      disabled={disabled}
                      rows={4}
                      placeholder="Escribe la regla o condición…"
                      onChange={(e) => updateItem(item.id, { texto: e.target.value })}
                    />
                  </label>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
