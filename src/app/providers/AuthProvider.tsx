import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { AuthSession, AuthUser } from '@modules/auth/domain/types'
import { logoutUseCase } from '@modules/auth/application/logoutUseCase'
import { readSession } from '@shared/security/sessionStorage'
import { AuthContext } from '@app/providers/authContext'

function sessionFromStorage(): { user: AuthUser; token: string } | null {
  const stored = readSession()
  if (!stored) return null

  return {
    token: stored.token,
    user: {
      username: stored.username,
      displayName: stored.displayName,
      role: stored.role,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = sessionFromStorage()
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)

  const setSession = useCallback((session: AuthSession) => {
    setUser(session.user)
    setToken(session.token)
  }, [])

  const logout = useCallback(() => {
    logoutUseCase()
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      setSession,
      logout,
    }),
    [user, token, setSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
