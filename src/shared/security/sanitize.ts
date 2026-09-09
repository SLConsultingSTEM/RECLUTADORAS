import DOMPurify from 'dompurify'

/** Sanitiza HTML de descripciones de proyecto antes de renderizar. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  })
}
