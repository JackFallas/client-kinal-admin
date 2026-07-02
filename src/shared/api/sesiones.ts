import { api } from './api'

export const getSesionesActivas = (params?: { role?: string; tipoDispositivo?: string }) =>
  api.get('/sesiones', { params })
export const kickSesion = (id: number) => api.patch(`/sesiones/${id}/kick`)
