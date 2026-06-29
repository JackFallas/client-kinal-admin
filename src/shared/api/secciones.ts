import { api } from './api'

export interface FiltrosPanelSeccion {
  nivel?: 'BASICOS' | 'DIVERSIFICADOS'
  grado?: number
  tipo?: 'academica' | 'tecnica'
}

export const getSecciones = () => api.get('/secciones')
export const getSeccionesPanel = (params?: FiltrosPanelSeccion) => api.get('/secciones/panel', { params })
export const getSeccion = (id: number) => api.get(`/secciones/${id}`)
export const createSeccion = (data: Record<string, unknown>) => api.post('/secciones', data)
export const updateSeccion = (id: number, data: Record<string, unknown>) =>
  api.patch(`/secciones/${id}`, data)
export const deactivateSeccion = (id: number) => api.delete(`/secciones/${id}`)
