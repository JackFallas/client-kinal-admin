import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { AdminRole } from '../../../shared/api/auth'

interface Props {
  children: React.ReactNode
  roles?: AdminRole[]
}

export const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/portal/dashboard" replace />
  return <>{children}</>
}
