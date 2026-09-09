import { AuthError } from '@modules/auth/domain/AuthError'
import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from '@modules/auth/domain/types'
import { ApiError } from '@shared/api/types'
import { httpClient } from '@shared/api/HttpClient'
import type { UserRole } from '@modules/auth/domain/roles'

interface LoginResponse {
  token: string
  user: {
    username: string
    displayName: string
    role: UserRole
  }
}

interface LoginErrorBody {
  field?: 'username' | 'password'
  code?: string
}

function mapLoginError(error: unknown): never {
  if (error instanceof ApiError) {
    const body = error.body as LoginErrorBody | null | undefined
    const code = body?.code?.toUpperCase() ?? ''
    const field = body?.field

    // Mensajes fijos de cliente: no reenviar textos crudos del backend.
    if (field === 'username' || code.includes('USERNAME') || code === 'INVALID_USER') {
      throw new AuthError('username', 'Usuario incorrecto')
    }

    if (field === 'password' || code.includes('PASSWORD') || code === 'INVALID_PASSWORD') {
      throw new AuthError('password', 'La contraseña no es válida')
    }

    if (error.status === 401 || error.status === 403) {
      throw new AuthError('password', 'La contraseña no es válida')
    }

    throw new AuthError('password', 'No se pudo iniciar sesión')
  }

  throw new AuthError('password', 'No se pudo iniciar sesión')
}

export class ApiAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const data = await httpClient.request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: credentials,
      })

      return {
        token: data.token,
        user: data.user,
      }
    } catch (error) {
      mapLoginError(error)
    }
  }
}
