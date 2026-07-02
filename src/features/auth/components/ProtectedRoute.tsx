import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useKickListener } from '../../../shared/hooks/useKickListener'
import { useAlertNotifications } from '../../../shared/hooks/useAlertNotifications'
import { useInactivityLogout } from '../../../shared/hooks/useInactivityLogout'
import type { AdminRole } from '../../../shared/api/auth'

interface Props {
  children: React.ReactNode
  roles?: AdminRole[]
}

export const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user } = useAuthStore()
  useKickListener()
  useAlertNotifications()
  useInactivityLogout()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/portal/dashboard" replace />
  return <>{children}</>
}
