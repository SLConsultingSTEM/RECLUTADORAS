import { ROLES, type UserRole } from '@modules/auth/domain/roles'

const SESSION_KEY = 'reclutadoras.session'

export interface StoredSession {
  token: string
  role: UserRole
  username: string
  displayName: string
}

function isUserRole(value: unknown): value is UserRole {
  return value === ROLES.RECLUTADORA || value === ROLES.COORDINADORA
}

export function saveSession(session: StoredSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function readSession(): StoredSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (
      typeof parsed.token !== 'string' ||
      !parsed.token ||
      typeof parsed.username !== 'string' ||
      !parsed.username ||
      typeof parsed.displayName !== 'string' ||
      !isUserRole(parsed.role)
    ) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }

    return {
      token: parsed.token,
      role: parsed.role,
      username: parsed.username,
      displayName: parsed.displayName,
    }
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
