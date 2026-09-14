import createDOMPurify from 'dompurify'
import type { DOMPurify } from 'dompurify'

const DANGEROUS_URI = /^\s*(?:javascript|vbscript|data\s*:\s*text\/html)/i

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'svg', 'math', 'iframe', 'object', 'embed', 'form', 'input', 'button'] as string[],
  // `class` se permite: normalizeLabels inyecta clases CSS controladas por el módulo.
  FORBID_ATTR: ['style', 'id', 'srcset'] as string[],
  ALLOW_DATA_ATTR: false,
}

let purifier: DOMPurify | null = null

function getPurifier(): DOMPurify {
  if (purifier) return purifier

  const instance = createDOMPurify(window)
  instance.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof Element)) return

    for (const attr of [...node.attributes]) {
      if (/^on/i.test(attr.name)) {
        node.removeAttribute(attr.name)
      }
    }

    for (const attr of ['href', 'src', 'xlink:href', 'action']) {
      if (!node.hasAttribute(attr)) continue
      const value = node.getAttribute(attr) ?? ''
      if (DANGEROUS_URI.test(value)) {
        node.removeAttribute(attr)
      }
    }
  })

  purifier = instance
  return instance
}

/**
 * Capa extra independiente del motor DOM (happy-dom / browsers antiguos).
 * DOMPurify es la defensa principal; esto cubre fallos de parsing/tags.
 */
function hardenHtml(html: string): string {
  return html
    .replace(/<(script|iframe|object|embed|form|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|form|svg|math)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(
      /(\s(?:href|src|xlink:href|action)\s*=\s*)(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi,
      '$1$2#$2',
    )
}

/** Sanitiza HTML de descripciones de proyecto antes de renderizar. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  const instance = getPurifier()
  if (!instance.isSupported) {
    return hardenHtml(dirty.replace(/<[^>]*>/g, ''))
  }

  const clean = instance.sanitize(dirty, SANITIZE_CONFIG)
  return hardenHtml(typeof clean === 'string' ? clean : String(clean))
}
