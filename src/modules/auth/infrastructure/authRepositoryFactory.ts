import { env } from '@shared/config/env'
import type { AuthRepository } from '@modules/auth/domain/types'
import { ApiAuthRepository } from '@modules/auth/infrastructure/ApiAuthRepository'
import { MockAuthRepository } from '@modules/auth/infrastructure/MockAuthRepository'

export function createAuthRepository(): AuthRepository {
  return env.useMock ? new MockAuthRepository() : new ApiAuthRepository()
}
