import { AuthError } from '@modules/auth/domain/AuthError'
import { ROLES } from '@modules/auth/domain/roles'
import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from '@modules/auth/domain/types'

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(600)

    const username = credentials.username.trim().toLowerCase()
    const account = MOCK_USERS[username]

    if (!account) {
      throw new AuthError('username', 'Usuario incorrecto')
    }

    if (account.password !== credentials.password) {
      throw new AuthError('password', 'La contraseña no es válida')
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
