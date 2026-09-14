export const env = {
  apiUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
  /**
   * Mock solo por defecto en desarrollo.
   * En producción requiere VITE_USE_MOCK=true explícito (no recomendado).
   */
  useMock: resolveUseMock(),
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const

function resolveUseMock(): boolean {
  const raw = import.meta.env.VITE_USE_MOCK

  if (raw === 'true') {
    if (import.meta.env.PROD) {
      console.error(
        '[security] VITE_USE_MOCK=true en build de producción. Desactívelo salvo entornos de demo controlados.',
      )
    }
    return true
  }

  if (raw === 'false') return false

  // Sin variable: mocks solo en `vite` (DEV), nunca en `vite build`.
  return import.meta.env.DEV
}
