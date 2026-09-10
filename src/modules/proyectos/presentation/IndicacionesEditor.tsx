import { useEffect, useMemo, useState } from 'react'
import {
  createEmptyIndicacion,
  type IndicacionEditable,
} from '@modules/proyectos/application/indicacionesMapper'
import { Button, IconButton } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState'
import {
  IconChevronDown,
  IconListChecks,
  IconPlus,
  IconTrash,
} from '@shared/ui/icons'
import styles from './ProyectoInfo.module.css'

interface IndicacionesEditorProps {
  items: IndicacionEditable[]
  onChange: (items: IndicacionEditable[]) => void
  disabled?: boolean
}

type SeccionGrupo = {
  key: string
  lead: string
  items: Array<{ item: IndicacionEditable; absoluteIndex: number }>
}

type FocusTarget =
  | { type: 'lead'; id: string }
  | { type: 'rule'; id: string }

function getGroupRange(items: IndicacionEditable[], index: number) {
  const lead = items[index]?.lead ?? ''
  let start = index
  while (start > 0 && items[start - 1]?.lead === lead) start -= 1
  let end = index
  while (end < items.length - 1 && items[end + 1]?.lead === lead) end += 1
  return { start, end, lead }
}

function groupBySection(items: IndicacionEditable[]): SeccionGrupo[] {
  const groups: SeccionGrupo[] = []

  items.forEach((item, absoluteIndex) => {
    const previous = items[absoluteIndex - 1]
    if (!previous || previous.lead !== item.lead) {
      groups.push({
        key: item.id,
        lead: item.lead,
        items: [{ item, absoluteIndex }],
      })
      return
    }
    groups[groups.length - 1]?.items.push({ item, absoluteIndex })
  })

  return groups
}

function focusEditorField(selector: string, selectText = false) {
  const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)
  if (!field) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  field.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  })

  field.classList.remove(styles.editorAttention)
  void field.offsetWidth
  field.classList.add(styles.editorAttention)

  const focusDelay = prefersReduced ? 0 : 280
  window.setTimeout(() => {
    field.focus({ preventScroll: true })
    if (selectText && 'select' in field) field.select()
  }, focusDelay)

  window.setTimeout(() => {
    field.classList.remove(styles.editorAttention)
  }, prefersReduced ? 0 : 750)
}

export function IndicacionesEditor({
  items,
  onChange,
  disabled = false,
}: IndicacionesEditorProps) {
  const secciones = useMemo(() => groupBySection(items), [items])
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(null)
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)

  useEffect(() => {
    if (secciones.length === 0) {
      setOpenSectionKey(null)
      return
    }
    setOpenSectionKey((prev) => {
      if (prev && secciones.some((seccion) => seccion.key === prev)) return prev
      return null
    })
  }, [secciones])

  useEffect(() => {
    if (!focusTarget) return
    const selector =
      focusTarget.type === 'lead'
        ? `[data-lead-id="${focusTarget.id}"]`
        : `[data-rule-id="${focusTarget.id}"]`
    const id = window.requestAnimationFrame(() => {
      focusEditorField(selector, focusTarget.type === 'lead')
      setFocusTarget(null)
    })
    return () => window.cancelAnimationFrame(id)
  }, [items, focusTarget, openSectionKey])

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

  function addSection() {
    const created = createEmptyIndicacion('Nuevo tema')
    onChange([...items, created])
    setOpenSectionKey(created.id)
    setFocusTarget({ type: 'lead', id: created.id })
  }

  function addRuleToSection(lead: string, absoluteIndex: number, sectionKey: string) {
    const { end } = getGroupRange(items, absoluteIndex)
    const created = createEmptyIndicacion(lead)
    const next = [...items]
    next.splice(end + 1, 0, created)
    onChange(next)
    setOpenSectionKey(sectionKey)
    setFocusTarget({ type: 'rule', id: created.id })
  }

  return (
    <section className={`${styles.contentBlock} ${styles.indicaciones}`}>
      <header className={`${styles.editorHeading} ${styles.editorHeadingSticky}`}>
        <div className={styles.editorHeadingTop}>
          <div className={styles.editorHeadingLead}>
            <span className={styles.panelLabel}>Indicaciones</span>
            <p className={styles.editorHelp}>
              Trabaja <strong>un tema a la vez</strong>. Abre el que necesites; el resto se mantiene
              cerrado para evitar tanto scroll.
            </p>
          </div>

          <div className={styles.editorHeaderActions}>
            <Button
              type="button"
              variant="soft"
              className={styles.editorActionBtn}
              icon={<IconPlus size={18} />}
              disabled={disabled}
              onClick={addSection}
            >
              Agregar tema
            </Button>
            <p className={styles.editorActionHint}>Se abre listo para editar</p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={`${styles.content} ${styles.contentReadable}`}>
          <EmptyState
            icon={<IconListChecks size={22} />}
            title="Aún no hay indicaciones"
            description="Empieza con un tema (por ejemplo “Tener en cuenta que”) y luego agrega las reglas una por una."
            action={
              <Button
                type="button"
                variant="soft"
                className={styles.editorActionBtn}
                icon={<IconPlus size={18} />}
                disabled={disabled}
                onClick={addSection}
              >
                Agregar primer tema
              </Button>
            }
          />
        </div>
      ) : (
        <div className={styles.editorSections}>
          {secciones.map((seccion) => {
            const firstAbsolute = seccion.items[0]?.absoluteIndex ?? 0
            const firstId = seccion.items[0]?.item.id
            const isOpen = openSectionKey === seccion.key
            const reglasCount = seccion.items.length

            return (
              <article
                key={seccion.key}
                className={`${styles.editorSectionCard} ${
                  isOpen ? styles.editorSectionCardOpen : styles.editorSectionCardCollapsed
                }`}
              >
                <button
                  type="button"
                  className={styles.editorSectionToggle}
                  aria-expanded={isOpen}
                  disabled={disabled}
                  onClick={() =>
                    setOpenSectionKey((prev) => (prev === seccion.key ? null : seccion.key))
                  }
                >
                  <span
                    className={`${styles.editorSectionChevron} ${
                      isOpen ? styles.editorSectionChevronOpen : ''
                    }`}
                    aria-hidden="true"
                  >
                    <IconChevronDown size={18} />
                  </span>
                  <span className={styles.editorSectionToggleBody}>
                    <span className={styles.editorSectionEyebrow}>Tema</span>
                    <strong className={styles.editorSectionToggleTitle}>
                      {seccion.lead.trim() || 'Sin título'}
                    </strong>
                  </span>
                  <span className={styles.editorSectionCount}>
                    {reglasCount} {reglasCount === 1 ? 'regla' : 'reglas'}
                  </span>
                </button>

                {isOpen ? (
                  <div className={styles.editorSectionBody}>
                    <div className={styles.editorSectionTitleBlock}>
                      <label className={styles.editorField}>
                        <span className={styles.editorSectionFieldLabel}>Título del tema</span>
                        <input
                          type="text"
                          data-lead-id={firstId}
                          value={seccion.lead}
                          disabled={disabled}
                          placeholder="Ej. Tener en cuenta que:"
                          onChange={(e) => updateGroupLead(firstAbsolute, e.target.value)}
                        />
                      </label>
                    </div>

                    <ol className={styles.editorList}>
                      {seccion.items.map(({ item, absoluteIndex }) => {
                        const numero = absoluteIndex + 1
                        return (
                          <li key={item.id} className={styles.editorItem}>
                            <div className={styles.editorItemHead}>
                              <strong className={styles.editorRuleLabel}>Regla {numero}</strong>
                              <IconButton
                                type="button"
                                label={`Eliminar regla ${numero}`}
                                variant="plain"
                                disabled={disabled}
                                onClick={() => removeItem(item.id)}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </div>

                            <label className={styles.editorField}>
                              <span className={styles.srOnly}>Texto de la regla {numero}</span>
                              <textarea
                                data-rule-id={item.id}
                                value={item.texto}
                                disabled={disabled}
                                rows={2}
                                placeholder="Escribe la condición o instrucción para la reclutadora…"
                                onChange={(e) => updateItem(item.id, { texto: e.target.value })}
                              />
                            </label>
                          </li>
                        )
                      })}
                    </ol>

                    <div className={styles.editorSectionFooter}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<IconPlus size={16} />}
                        disabled={disabled}
                        onClick={() =>
                          addRuleToSection(seccion.lead, firstAbsolute, seccion.key)
                        }
                      >
                        Agregar regla a este tema
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
