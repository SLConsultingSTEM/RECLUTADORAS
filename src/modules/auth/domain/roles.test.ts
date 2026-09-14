import { describe, expect, it } from 'vitest'
import { ROLES, canAccessAdmin, isCoordinadora } from '@modules/auth/domain/roles'

describe('roles', () => {
  it('solo coordinadora accede a admin', () => {
    expect(canAccessAdmin(ROLES.COORDINADORA)).toBe(true)
    expect(canAccessAdmin(ROLES.RECLUTADORA)).toBe(false)
    expect(isCoordinadora(ROLES.RECLUTADORA)).toBe(false)
  })
})
