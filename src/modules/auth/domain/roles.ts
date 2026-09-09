export const ROLES = {
  RECLUTADORA: 'reclutadora',
  COORDINADORA: 'coordinadora',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export function isCoordinadora(role: UserRole): boolean {
  return role === ROLES.COORDINADORA
}

export function canAccessAdmin(role: UserRole): boolean {
  return isCoordinadora(role)
}
