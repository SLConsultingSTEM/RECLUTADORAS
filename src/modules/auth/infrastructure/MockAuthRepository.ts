import { AuthError } from '@modules/auth/domain/AuthError'
import { ROLES } from '@modules/auth/domain/roles'
import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from '@modules/auth/domain/types'

/** Credenciales solo para desarrollo local. Nunca usar en producción. */
const MOCK_USERS: Record<
  string,
  { password: string; role: AuthSession['user']['role']; displayName: string }
> = {
  reclutadora: {
    password: '1234',
    role: ROLES.RECLUTADORA,
    displayName: 'Reclutadora Demo',
  },
  coordinadora: {
    password: '1234',
    role: ROLES.COORDINADORA,
    displayName: 'Coordinadora Demo',
  },
}

const GENERIC_LOGIN_ERROR = 'Usuario o contraseña incorrectos'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(600)

    const username = credentials.username.trim().toLowerCase()
    const account = MOCK_USERS[username]

    // Mensaje y campo genéricos: evita enumeración de usuarios en demo.
    if (!account || account.password !== credentials.password) {
      throw new AuthError('password', GENERIC_LOGIN_ERROR)
    }

    return {
      token: `mock-token-${account.role}-${Date.now()}`,
      user: {
        username,
        displayName: account.displayName,
        role: account.role,
      },
    }
  }
}
