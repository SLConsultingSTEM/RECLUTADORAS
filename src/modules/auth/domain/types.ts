import type { UserRole } from '@modules/auth/domain/roles'

export interface AuthUser {
  username: string
  displayName: string
  role: UserRole
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
}
