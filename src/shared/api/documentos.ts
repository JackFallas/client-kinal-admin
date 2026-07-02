import { api } from './api'

export const getDocumentosEstudiante = (carnet: string) =>
  api.get(`/documentos/estudiante/${carnet}`)

export const getDocumentosPorArea = () => api.get('/documentos/area')

export const getArchivoDocumento = (id: number) =>
  api.get(`/documentos/${id}/archivo`, { responseType: 'blob' })

export const verificarDocumento = (id: number) => api.patch(`/documentos/${id}/verificar`)

export const eliminarDocumento = (id: number) => api.delete(`/documentos/${id}`)

export const listarPlantillas = () => api.get('/documentos/plantillas')

export const subirPlantilla = (tipo: string, formData: FormData) =>
  api.post(`/documentos/plantillas/${tipo}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getArchivoPlantilla = (tipo: string) =>
  api.get(`/documentos/plantillas/${tipo}/archivo`, { responseType: 'blob' })
