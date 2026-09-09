import { createContext } from 'react'
import type { AuthSession, AuthUser } from '@modules/auth/domain/types'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
