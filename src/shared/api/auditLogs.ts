import { api } from './api'

export const getAuditLogs = (params?: Record<string, string | number>) =>
  api.get('/audit-logs', { params })
