import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { LoginForm } from '../../features/auth/components/LoginForm'
import { MainLayout } from '../../shared/components/layouts/MainLayout'
import { DashboardPage } from '../../features/dashboard/components/DashboardPage'
import { VisitasPage } from '../../features/visitas/components/VisitasPage'
import { NuevaVisitaPage } from '../../features/visitas/components/NuevaVisitaPage'
import { AlertasPage } from '../../features/alertas/components/AlertasPage'
import { DocumentosPage } from '../../features/documentos/components/DocumentosPage'
import { UsuariosPage } from '../../features/usuarios/components/UsuariosPage'
import { SeccionesPage } from '../../features/secciones/components/SeccionesPage'
import { SesionesPage } from '../../features/sesiones/components/SesionesPage'
import { useAuthStore } from '../../features/auth/store/authStore'

const CoordOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  if (user?.role === 'ENFERMERO') return <Navigate to="/portal/visitas/nueva" replace />
  return <>{children}</>
}

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/portal" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<DashboardPage />} />
      <Route path="visitas" element={<VisitasPage />} />
      <Route path="visitas/nueva" element={<NuevaVisitaPage />} />
      <Route path="alertas" element={<AlertasPage />} />
      <Route path="documentos" element={<DocumentosPage />} />
      <Route path="usuarios" element={<CoordOnly><UsuariosPage /></CoordOnly>} />
      <Route path="secciones" element={<CoordOnly><SeccionesPage /></CoordOnly>} />
      <Route path="sesiones" element={<CoordOnly><SesionesPage /></CoordOnly>} />
    </Route>
    <Route path="*" element={<Navigate to="/portal" replace />} />
  </Routes>
)
