import type { AuthRepository, LoginCredentials } from '@modules/auth/domain/types'
import { saveSession } from '@shared/security/sessionStorage'

export async function loginUseCase(
  repository: AuthRepository,
  credentials: LoginCredentials,
) {
  const session = await repository.login(credentials)

  saveSession({
    token: session.token,
    role: session.user.role,
    username: session.user.username,
    displayName: session.user.displayName,
  })

  return session
}
