/** Indicación editable: texto plano + encabezado de sección opcional. */
export type IndicacionEditable = {
  id: string
  lead: string
  texto: string
}

type IndicacionBlock =
  | { type: 'html'; html: string }
  | { type: 'list'; items: string[] }

function createId() {
  return `ind-${crypto.randomUUID().slice(0, 8)}`
}

function htmlToPlain(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Quita el H3 inicial del HTML (p. ej. "Información de…"). */
export function stripLeadingHeading(html: string) {
  return html.replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, '').trim()
}

/** Separa labels/texto libre de listas numeradas. */
export function parseIndicacionBlocks(html: string): IndicacionBlock[] {
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

/** Convierte descripcionHtml del proyecto en lista editable. */
export function descripcionToIndicaciones(descripcionHtml: string): IndicacionEditable[] {
  const body = stripLeadingHeading(descripcionHtml)
  const blocks = parseIndicacionBlocks(body)
  const items: IndicacionEditable[] = []
  let currentLead = ''

  blocks.forEach((block) => {
    if (block.type === 'html') {
      currentLead = htmlToPlain(block.html)
      return
    }

    block.items.forEach((itemHtml) => {
      items.push({
        id: createId(),
        lead: currentLead,
        texto: htmlToPlain(itemHtml),
      })
    })
  })

  return items
}

/** Reconstruye descripcionHtml a partir de la lista editable. */
export function indicacionesToDescripcion(
  nombreProyecto: string,
  indicaciones: IndicacionEditable[],
): string {
  const validas = indicaciones
    .map((item) => ({
      lead: item.lead.trim(),
      texto: item.texto.trim(),
    }))
    .filter((item) => item.texto.length > 0)

  const heading = `<h3>Información de ${escapeHtml(nombreProyecto)}</h3>`

  if (validas.length === 0) {
    return `${heading}\n`
  }

  const groups: { lead: string; textos: string[] }[] = []
  validas.forEach((item) => {
    const last = groups[groups.length - 1]
    if (last && last.lead === item.lead) {
      last.textos.push(item.texto)
      return
    }
    groups.push({ lead: item.lead, textos: [item.texto] })
  })

  const body = groups
    .map((group) => {
      const label = group.lead
        ? `<label>${escapeHtml(group.lead)}</label>`
        : ''
      const list = [
        '<ol style="font-weight: bold;">',
        ...group.textos.map(
          (texto) =>
            `<li><span style="font-weight: normal;">${escapeHtml(texto)}</span></li>`,
        ),
        '</ol>',
      ].join('\n')
      return [label, list].filter(Boolean).join('\n')
    })
    .join('\n')

  return `${heading}\n${body}\n`
}

export function createEmptyIndicacion(lead = ''): IndicacionEditable {
  return {
    id: createId(),
    lead,
    texto: '',
  }
}
