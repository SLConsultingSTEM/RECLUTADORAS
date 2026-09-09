import { clearSession } from '@shared/security/sessionStorage'

export function logoutUseCase(): void {
  clearSession()
}
