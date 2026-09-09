import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@app/providers/useAuth'
import { canAccessAdmin } from '@modules/auth/domain/roles'

export function RequireCoordinadora() {
  const { user } = useAuth()

  if (!user || !canAccessAdmin(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
