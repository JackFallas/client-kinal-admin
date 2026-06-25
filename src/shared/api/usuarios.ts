import { api } from './api'

export const getUsuarios = (params?: Record<string, string | number | boolean>) =>
  api.get('/usuarios', { params })

export const getUsuario = (carnet: string) => api.get(`/usuarios/${carnet}`)

export const createUsuario = (data: Record<string, unknown>) => api.post('/usuarios', data)

export const updateUsuario = (carnet: string, data: Record<string, unknown>) =>
  api.patch(`/usuarios/${carnet}`, data)

export const changePassword = (carnet: string, password: string) =>
  api.patch(`/usuarios/${carnet}/password`, { password })

export const deactivateUsuario = (carnet: string) => api.delete(`/usuarios/${carnet}`)

export const toggleUsuarioActivo = (carnet: string, activo: boolean) =>
  api.patch(`/usuarios/${carnet}`, { activo })
