import { env } from '@shared/config/env'
import { ApiError, type HttpRequestOptions } from '@shared/api/types'

const DEFAULT_TIMEOUT_MS = 15_000

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (options.authToken) {
      headers.Authorization = `Bearer ${options.authToken}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options.signal ?? controller.signal,
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
    } finally {
      clearTimeout(timeout)
    }
  }
}

export const httpClient = new HttpClient()
