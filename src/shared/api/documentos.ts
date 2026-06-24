import { api } from './api'

export const getDocumentosEstudiante = (carnet: string) =>
  api.get(`/documentos/estudiante/${carnet}`)

export const verificarDocumento = (id: number) => api.patch(`/documentos/${id}/verificar`)

export const eliminarDocumento = (id: number) => api.delete(`/documentos/${id}`)
