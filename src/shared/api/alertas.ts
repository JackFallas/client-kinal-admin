import { api } from './api'

export const getAlertas = (params?: Record<string, string | number | boolean>) =>
  api.get('/alertas', { params })

export const marcarAlertaLeida = (id: number) => api.patch(`/alertas/${id}/leer`)
