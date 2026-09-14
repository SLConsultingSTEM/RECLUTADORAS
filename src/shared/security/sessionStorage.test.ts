import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  readSession,
  saveSession,
} from '@shared/security/sessionStorage'
import { ROLES } from '@modules/auth/domain/roles'

describe('sessionStorage', () => {
  beforeEach(() => {
    clearSession()
  })

  it('persiste y lee una sesión válida', () => {
    saveSession({
      token: 'tok-1',
      role: ROLES.RECLUTADORA,
      username: 'ana',
      displayName: 'Ana',
    })

    expect(readSession()).toEqual({
      token: 'tok-1',
      role: ROLES.RECLUTADORA,
      username: 'ana',
      displayName: 'Ana',
    })
  })

  it('descarta rol inválido (anti-tampering básico)', () => {
    sessionStorage.setItem(
      'reclutadoras.session',
      JSON.stringify({
        token: 'tok',
        role: 'admin',
        username: 'x',
        displayName: 'X',
      }),
    )

    expect(readSession()).toBeNull()
  })
})
