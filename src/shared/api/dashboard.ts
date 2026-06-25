import { api } from './api'

export const getDashboard = () => api.get('/dashboard')
export const getSesionesActivas = () => api.get('/sesiones')
export const kickSesion = (id: number) => api.patch(`/sesiones/${id}/kick`)
