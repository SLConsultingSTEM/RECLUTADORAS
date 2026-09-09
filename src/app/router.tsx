import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@app/providers/AuthProvider'
import { useAuth } from '@app/providers/useAuth'
import { RequireAuth } from '@app/guards/RequireAuth'
import { RequireCoordinadora } from '@app/guards/RequireCoordinadora'
import { AppLayout } from '@app/layouts/AppLayout'
import { LoginPage } from '@modules/auth/presentation/LoginPage'
import { PanelReclutadoraPage } from '@modules/proyectos/presentation/PanelReclutadoraPage'
import { NuevoRegistroPage } from '@modules/proyectos/presentation/NuevoRegistroPage'

const AdminPage = lazy(() =>
  import('@modules/admin/presentation/AdminPage').then((module) => ({
    default: module.AdminPage,
  })),
)

function LoginRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/panel" replace />
  return <LoginPage />
}

function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>Página no encontrada.</p>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/panel" replace />} />
              <Route path="panel" element={<PanelReclutadoraPage />} />
              <Route path="nuevo-registro" element={<NuevoRegistroPage />} />
              <Route element={<RequireCoordinadora />}>
                <Route
                  path="admin"
                  element={
                    <Suspense fallback={<p>Cargando panel…</p>}>
                      <AdminPage />
                    </Suspense>
                  }
                />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
