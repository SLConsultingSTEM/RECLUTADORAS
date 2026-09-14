import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@app/providers/AuthProvider'
import { useAuth } from '@app/providers/useAuth'
import { RequireAuth } from '@app/guards/RequireAuth'
import { RequireCoordinadora } from '@app/guards/RequireCoordinadora'
import { AppLayout } from '@app/layouts/AppLayout'
import { LoginPage } from '@modules/auth/presentation/LoginPage'
import { SkeletonBlock } from '@shared/ui/Skeleton'

const PanelReclutadoraPage = lazy(() =>
  import('@modules/proyectos/presentation/PanelReclutadoraPage').then((module) => ({
    default: module.PanelReclutadoraPage,
  })),
)

const NuevoRegistroPage = lazy(() =>
  import('@modules/proyectos/presentation/NuevoRegistroPage').then((module) => ({
    default: module.NuevoRegistroPage,
  })),
)

const AdminPage = lazy(() =>
  import('@modules/admin/presentation/AdminPage').then((module) => ({
    default: module.AdminPage,
  })),
)

function RouteFallback({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-live="polite" style={{ padding: '1.25rem 0' }}>
      <SkeletonBlock height={220} />
      <span className="sr-only">{label}</span>
    </div>
  )
}

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
              <Route
                path="panel"
                element={
                  <Suspense fallback={<RouteFallback label="Cargando panel…" />}>
                    <PanelReclutadoraPage />
                  </Suspense>
                }
              />
              <Route
                path="nuevo-registro"
                element={
                  <Suspense fallback={<RouteFallback label="Cargando registro…" />}>
                    <NuevoRegistroPage />
                  </Suspense>
                }
              />
              <Route element={<RequireCoordinadora />}>
                <Route
                  path="admin"
                  element={
                    <Suspense fallback={<RouteFallback label="Cargando administración…" />}>
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
