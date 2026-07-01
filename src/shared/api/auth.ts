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

export const olvidePasswordApi = (email: string) =>
  api.post<{ message: string }>('/auth/olvide-password', { email })

export const restablecerPasswordApi = (data: { codigo: string; token?: string; email?: string; password: string }) =>
  api.post<{ message: string }>('/auth/restablecer-password', data)

export const reenviarCodigoApi = (email: string) =>
  api.post<{ message: string }>('/auth/reenviar-codigo', { email })

export const verificarCuentaApi = (data: { codigo: string; email: string }) =>
  api.post<{ message: string }>('/auth/verificar', data)
