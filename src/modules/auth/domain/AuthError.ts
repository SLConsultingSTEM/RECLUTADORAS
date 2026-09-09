export type AuthErrorField = 'username' | 'password'

export class AuthError extends Error {
  readonly field: AuthErrorField

  constructor(field: AuthErrorField, message: string) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}
