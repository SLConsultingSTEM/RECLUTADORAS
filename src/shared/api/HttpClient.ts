import { env } from '@shared/config/env'
import { ApiError, type HttpRequestOptions } from '@shared/api/types'

const DEFAULT_TIMEOUT_MS = 15_000

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        'VITE_API_URL no está configurada. Configure la URL de la API o active mocks solo en desarrollo.',
        0,
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const externalSignal = options.signal

    const onExternalAbort = () => controller.abort()
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort()
      } else {
        externalSignal.addEventListener('abort', onExternalAbort, { once: true })
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    // FormData (subida de archivos) viaja tal cual: el navegador pone el
    // Content-Type con el boundary, y fijarlo a mano rompe el multipart.
    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData

    if (options.body !== undefined && !isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    if (options.authToken) {
      headers.Authorization = `Bearer ${options.authToken}`
    }

    try {
      const method = options.method ?? 'GET'
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body:
          options.body === undefined
            ? undefined
            : isFormData
              ? (options.body as FormData)
              : JSON.stringify(options.body),
        signal: controller.signal,
        credentials: 'omit',
        cache: options.cache ?? (method === 'GET' ? 'default' : 'no-store'),
      })

      if (response.status === 204) {
        return undefined as T
      }

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new ApiError(
          (payload as { message?: string } | null)?.message ??
            `Error HTTP ${response.status}`,
          response.status,
          payload,
        )
      }

      return payload as T
    } catch (error) {
      if (error instanceof ApiError) throw error

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('La solicitud superó el tiempo de espera', 408)
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Error de red',
        0,
      )
    } finally {
      clearTimeout(timeout)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }
  }
}

export const httpClient = new HttpClient()
