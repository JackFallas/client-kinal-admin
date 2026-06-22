import { api } from './api'

export type AdminRole = 'AUDITOR' | 'COORDINADOR' | 'ENFERMERO'

export interface AuthUser {
  id: number
  carnet?: string
  nombre: string
  apellido: string
  email: string
  role: AdminRole
}

export const loginApi = (email: string, password: string) =>
  api.post<{ access_token: string; usuario: AuthUser }>('/auth/login', { email, password })

export const logoutApi = () => api.post('/auth/logout')

export const getMeApi = () => api.get<AuthUser>('/auth/me')
