import { api } from './api'

export type AdminRole = 'AUDITOR' | 'COORDINADOR'

export interface AuthUser {
  id: number
  carnet?: string
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
  email: string
  role: AdminRole
  areaNivel?: string
  areaGrado?: number
  fotoPerfil?: string | null
}

export const loginApi = (email: string, password: string) =>
  api.post<{ access_token: string; usuario: AuthUser }>('/auth/login', { email, password })

export const logoutApi = () => api.post('/auth/logout')

export const getMeApi = () => api.get<AuthUser>('/auth/me')

export const cambiarFotoPerfilApi = (formData: FormData) =>
  api.post<{ fotoPerfil: string }>('/usuarios/foto-perfil', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const eliminarFotoPerfilApi = () => api.delete('/usuarios/foto-perfil')
