import { useEffect, useMemo, useState } from 'react'
import { sanitizeHtml } from '@shared/security/sanitize'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import {
  IconChevronLeft,
  IconChevronRight,
  IconImage,
  IconListChecks,
  IconMapPin,
} from '@shared/ui/icons'
import { PiezaGraficaPanel } from '@modules/proyectos/presentation/PiezaGraficaPanel'
import styles from './ProyectoInfo.module.css'

interface ProyectoInfoProps {
  nombre: string
  descripcionHtml: string
  imagenUrl: string
  imagenNombre: string
  ciudades?: string[]
  camposCount?: number
  compact?: boolean
  /** Vista reclutar: pieza gráfica + indicaciones */
  mediaOnly?: boolean
}

type IndicacionBlock =
  | { type: 'html'; html: string }
  | { type: 'list'; items: string[] }

type IndicacionRegla = {
  leadHtml: string
  html: string
}

const REGLAS_POR_PAGINA = 5

/** Convierte <label> del HTML legado en párrafos de introducción. */
function normalizeLabels(html: string, leadClass: string) {
  return html
    .replace(/<label\b[^>]*>/gi, `<p class="${leadClass}">`)
    .replace(/<\/label>/gi, '</p>')
}

/** Si el ítem viene envuelto en un único <span>, lo desenvuelve para fluir con el número. */
function unwrapSingleSpan(html: string) {
  const trimmed = html.trim()
  const matched = trimmed.match(/^<span\b[^>]*>([\s\S]*)<\/span>$/i)
  return matched ? matched[1] : trimmed
}

/** Quita el H3 inicial del HTML (p. ej. "Información de…") para controlar el título en UI. */
function stripLeadingHeading(html: string) {
  return html.replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, '').trim()
}

/** Separa labels/texto libre de listas para poder numerar en React. */
function parseIndicacionBlocks(html: string): IndicacionBlock[] {
  if (typeof DOMParser === 'undefined') {
    return [{ type: 'html', html }]
  }

  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html')
  const root = doc.getElementById('root') ?? doc.body
  if (!root) return [{ type: 'html', html }]

  const readListItems = (list: Element) =>
    Array.from(list.children)
      .filter((child) => child.tagName === 'LI')
      .map((li) => (li as HTMLElement).innerHTML.trim())
      .filter(Boolean)

  const blocks: IndicacionBlock[] = []
  let htmlParts: string[] = []

  const flushHtml = () => {
    const joined = htmlParts.join('').trim()
    if (joined) blocks.push({ type: 'html', html: joined })
    htmlParts = []
  }

  Array.from(root.children).forEach((el) => {
    if (el.tagName === 'OL' || el.tagName === 'UL') {
      flushHtml()
      const items = readListItems(el)
      if (items.length) blocks.push({ type: 'list', items })
      return
    }
    htmlParts.push(el.outerHTML)
  })

  flushHtml()

  if (!blocks.some((block) => block.type === 'list')) {
    const lists = Array.from(root.querySelectorAll('ol, ul'))
      .map((list) => readListItems(list))
      .filter((items) => items.length > 0)
      .map((items) => ({ type: 'list' as const, items }))

    if (lists.length) return lists
  }

  return blocks.length ? blocks : [{ type: 'html', html }]
}

function flattenReglas(blocks: IndicacionBlock[]): IndicacionRegla[] {
  const reglas: IndicacionRegla[] = []
  let currentLead = ''

  blocks.forEach((block) => {
    if (block.type === 'html') {
      currentLead = block.html
      return
    }

    block.items.forEach((item) => {
      reglas.push({ leadHtml: currentLead, html: item })
    })
  })

  return reglas
}

function IndicacionesPanel({ html }: { html: string }) {
  const reglas = useMemo(
    () => flattenReglas(parseIndicacionBlocks(html)),
    [html],
  )
  const totalPaginas = Math.max(1, Math.ceil(reglas.length / REGLAS_POR_PAGINA))
  const [pagina, setPagina] = useState(0)

  useEffect(() => {
    setPagina(0)
  }, [html])

  useEffect(() => {
    if (pagina > totalPaginas - 1) setPagina(Math.max(0, totalPaginas - 1))
  }, [pagina, totalPaginas])

  const inicio = pagina * REGLAS_POR_PAGINA
  const visibles = reglas.slice(inicio, inicio + REGLAS_POR_PAGINA)
  const puedeAnterior = pagina > 0
  const puedeSiguiente = pagina < totalPaginas - 1

  let leadActual = ''

  return (
    <section className={`${styles.contentBlock} ${styles.indicaciones}`}>
      <header className={styles.projectHeadingBar}>
        <span className={styles.panelLabel}>Indicaciones</span>

        {totalPaginas > 1 ? (
          <div className={styles.pagerControls}>
            <button
              type="button"
              className={styles.pagerButton}
              aria-label="Reglas anteriores"
              disabled={!puedeAnterior}
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
                  className={`${styles.pagerDot} ${index === pagina ? styles.pagerDotActive : ''}`}
                  onClick={() => setPagina(index)}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.pagerButton}
              aria-label="Siguientes reglas"
              disabled={!puedeSiguiente}
              onClick={() => setPagina((value) => Math.min(totalPaginas - 1, value + 1))}
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </header>

      {reglas.length === 0 ? (
        <div className={`${styles.content} ${styles.contentReadable}`}>
          <EmptyState
            icon={<IconListChecks size={22} />}
            title="Sin indicaciones"
            description="Este proyecto no tiene reglas o condiciones publicadas."
          />
        </div>
      ) : (
        <div className={`${styles.content} ${styles.contentReadable}`}>
          <ol className={styles.indicacionesList}>
            {visibles.map((regla, index) => {
              const numero = inicio + index + 1
              const mostrarLead = Boolean(regla.leadHtml) && regla.leadHtml !== leadActual
              if (mostrarLead) leadActual = regla.leadHtml

              return (
                <li className={styles.indicacionGroup} key={`regla-${numero}`}>
                  {mostrarLead ? (
                    <div
                      className={styles.indicacionHtml}
                      dangerouslySetInnerHTML={{ __html: regla.leadHtml }}
                    />
                  ) : null}
                  <div className={styles.indicacionItem}>
                    <p className={styles.indicacionLine}>
                      <strong className={styles.indicacionNum}>{numero}.</strong>
                      <span
                        className={styles.indicacionText}
                        dangerouslySetInnerHTML={{ __html: unwrapSingleSpan(regla.html) }}
                      />
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}

export function ProyectoInfo({
  nombre,
  descripcionHtml,
  imagenUrl,
  imagenNombre,
  ciudades = [],
  camposCount = 0,
  compact = false,
  mediaOnly = false,
}: ProyectoInfoProps) {
  if (mediaOnly) {
    const cuerpoHtml = normalizeLabels(
      sanitizeHtml(stripLeadingHeading(descripcionHtml)),
      styles.indicacionLead,
    )

    return (
      <article className={`${styles.article} ${styles.reclutarInfo}`}>
        <div className={styles.reclutarSplit}>
          <IndicacionesPanel html={cuerpoHtml} />

          {imagenUrl ? (
            <PiezaGraficaPanel
              nombre={nombre}
              imagenUrl={imagenUrl}
              imagenNombre={imagenNombre}
            />
          ) : (
            <aside className={styles.mediaFeature}>
              <EmptyState
                icon={<IconImage size={22} />}
                title="Sin pieza gráfica"
                description="Este proyecto aún no tiene imagen para descargar."
              />
            </aside>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className={`${styles.article} ${compact ? styles.compact : ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{nombre}</h2>
        <div className={styles.meta}>
          <Badge tone="primary" icon={<IconMapPin size={13} />}>
            {ciudades.length || 0} ciudades
          </Badge>
          <Badge tone="accent" icon={<IconListChecks size={13} />}>
            {camposCount} campos
          </Badge>
        </div>
      </header>

      {imagenUrl ? (
        <section className={styles.media}>
          <div className={styles.mediaTop}>
            <span className={styles.mediaLabel}>
              <IconImage size={15} />
              Pieza gráfica
            </span>
            <a className={styles.download} href={imagenUrl} download={imagenNombre}>
              <IconDownload size={15} />
              Descargar
            </a>
          </div>
          <img src={imagenUrl} alt={`Pieza gráfica de ${nombre}`} className={styles.image} />
        </section>
      ) : null}

      <section className={styles.contentBlock}>
        <h3 className={styles.contentTitle}>Condiciones</h3>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(descripcionHtml) }}
        />
      </section>
    </article>
  )
}
