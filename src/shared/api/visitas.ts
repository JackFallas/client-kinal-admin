import { api } from './api'

export interface CreateVisitaPayload {
  estudianteCarnet: string
  motivo: string
  descripcion?: string
  temperatura?: number
  presion?: string
  peso?: number
  tratamiento?: string
  observaciones?: string
  emitirAlerta: boolean
  mensajeAlerta?: string
}

export const getVisitas = (params?: Record<string, string | number>) =>
  api.get('/visitas', { params })

export const getVisita = (id: number) => api.get(`/visitas/${id}`)

export const createVisita = (data: CreateVisitaPayload) => api.post('/visitas', data)
