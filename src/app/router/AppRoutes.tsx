import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { LoginForm } from '../../features/auth/components/LoginForm'
import { OlvidePasswordPage } from '../../features/auth/components/OlvidePasswordPage'
import { VerificarCuentaPage } from '../../features/auth/components/VerificarCuentaPage'
import { MainLayout } from '../../shared/components/layouts/MainLayout'
import { DashboardPage } from '../../features/dashboard/components/DashboardPage'
import { VisitasPage } from '../../features/visitas/components/VisitasPage'
import { AlertasPage } from '../../features/alertas/components/AlertasPage'
import { DocumentosPage } from '../../features/documentos/components/DocumentosPage'
import { UsuariosPage } from '../../features/usuarios/components/UsuariosPage'
import { SeccionesPage } from '../../features/secciones/components/SeccionesPage'
import { SesionesPage } from '../../features/sesiones/components/SesionesPage'
import { AuditLogsPage } from '../../features/audit-logs/components/AuditLogsPage'

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/olvide-password" element={<OlvidePasswordPage />} />
    <Route path="/verificar-cuenta" element={<VerificarCuentaPage />} />
    <Route path="/portal" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<DashboardPage />} />
      <Route path="visitas" element={<VisitasPage />} />
      <Route path="alertas" element={<AlertasPage />} />
      <Route path="documentos" element={<DocumentosPage />} />
      <Route path="usuarios" element={<UsuariosPage />} />
      <Route path="secciones" element={<SeccionesPage />} />
      <Route path="sesiones" element={<SesionesPage />} />
      <Route path="audit-logs" element={<AuditLogsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/portal" replace />} />
  </Routes>
)
