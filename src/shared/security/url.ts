/**
 * Valida URLs usadas en img/href para piezas gráficas.
 * Permite rutas relativas de la app, http(s) y data:image/*.
 */
export function isSafeMediaUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !trimmed.includes('\\') && !trimmed.includes('\0')
  }

  if (trimmed.startsWith('data:image/')) {
    const metaEnd = trimmed.indexOf(',')
    if (metaEnd <= 'data:image/'.length) return false
    const meta = trimmed.slice(0, metaEnd).toLowerCase()
    return meta.includes(';base64') && !meta.includes('svg')
  }

  try {
    const url = new URL(trimmed)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Devuelve la URL solo si es segura; si no, cadena vacía. */
export function safeMediaUrl(value: string | null | undefined): string {
  if (!value) return ''
  return isSafeMediaUrl(value) ? value.trim() : ''
}
