import { AuthError } from '@modules/auth/domain/AuthError'
import { ROLES, type UserRole } from '@modules/auth/domain/roles'
import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from '@modules/auth/domain/types'
import { ApiError } from '@shared/api/types'
import { httpClient } from '@shared/api/HttpClient'

interface LoginErrorBody {
  field?: 'username' | 'password'
  code?: string
}

const GENERIC_LOGIN_ERROR = 'Usuario o contraseña incorrectos'

function isRole(value: unknown): value is UserRole {
  return value === ROLES.RECLUTADORA || value === ROLES.COORDINADORA
}

function parseLoginResponse(data: unknown): AuthSession {
  if (!data || typeof data !== 'object') {
    throw new AuthError('password', 'Respuesta de autenticación inválida')
  }

  const root = data as Record<string, unknown>
  const token = root.token
  const user = root.user

  if (typeof token !== 'string' || token.length === 0) {
    throw new AuthError('password', 'Respuesta de autenticación inválida')
  }

  if (!user || typeof user !== 'object') {
    throw new AuthError('password', 'Respuesta de autenticación inválida')
  }

  const profile = user as Record<string, unknown>
  const username = profile.username
  const displayName = profile.displayName
  const role = profile.role

  if (
    typeof username !== 'string' ||
    username.length === 0 ||
    typeof displayName !== 'string' ||
    displayName.length === 0 ||
    !isRole(role)
  ) {
    throw new AuthError('password', 'Respuesta de autenticación inválida')
  }

  return {
    token,
    user: { username, displayName, role },
  }
}

function mapLoginError(error: unknown): never {
  if (error instanceof ApiError) {
    const body = error.body as LoginErrorBody | null | undefined
    const code = body?.code?.toUpperCase() ?? ''
    const field = body?.field

    // Mensaje genérico: evita enumeración de usuarios.
    // El campo se usa solo para foco UX, no para revelar qué falló.
    if (
      field === 'username' ||
      field === 'password' ||
      code.includes('USERNAME') ||
      code.includes('PASSWORD') ||
      code === 'INVALID_USER' ||
      code === 'INVALID_PASSWORD' ||
      error.status === 401 ||
      error.status === 403
    ) {
      throw new AuthError('password', GENERIC_LOGIN_ERROR)
    }

    throw new AuthError('password', 'No se pudo iniciar sesión')
  }

  throw new AuthError('password', 'No se pudo iniciar sesión')
}

export class ApiAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const data = await httpClient.request<unknown>('/api/v1/auth/login', {
        method: 'POST',
        body: {
          username: credentials.username.trim(),
          password: credentials.password,
        },
      })

      return parseLoginResponse(data)
    } catch (error) {
      if (error instanceof AuthError) throw error
      mapLoginError(error)
    }
  }
}
