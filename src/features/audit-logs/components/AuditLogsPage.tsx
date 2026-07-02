import { Fragment, useState, useEffect, useCallback } from 'react'
import { FiShield, FiFilter, FiRefreshCw, FiLoader, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { getAuditLogs } from '../../../shared/api/auditLogs'
import { useAuthStore } from '../../auth/store/authStore'
import toast from 'react-hot-toast'

interface AuditLog {
  id: number
  usuarioId?: number
  carnet?: string
  accion: string
  entidad: string
  entidadId?: string
  ip?: string
  detalles?: string
  nivelArea?: string
  gradoArea?: number
  fecha: string
}

interface DetallesParsed {
  descripcion?: string
  ruta?: string
  actor?: string | null
  rolActor?: string | null
  cambios?: Record<string, unknown>
}

const parseDetalles = (detalles?: string): DetallesParsed | null => {
  if (!detalles) return null
  try { return JSON.parse(detalles) } catch { return null }
}

const METODO_LABEL: Record<string, { label: string; color: string }> = {
  POST:   { label: 'CREÓ',     color: 'bg-emerald-100 text-emerald-700' },
  PATCH:  { label: 'MODIFICÓ', color: 'bg-amber-100 text-amber-700'    },
  PUT:    { label: 'ACTUALIZÓ',color: 'bg-blue-100 text-blue-700'      },
  DELETE: { label: 'ELIMINÓ',  color: 'bg-red-100 text-red-600'        },
}

const NIVEL_OPTIONS = [
  { value: '',              label: 'Todos los niveles' },
  { value: 'BASICOS',      label: 'Básicos'            },
  { value: 'DIVERSIFICADOS',label: 'Diversificados'    },
]

export const AuditLogsPage = () => {
  const { user } = useAuthStore()
  const isAuditor = user?.role === 'AUDITOR'

  const [logs, setLogs]         = useState<AuditLog[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [nivelArea, setNivelArea] = useState('')
  const [gradoArea, setGradoArea] = useState('')
  const [entidad, setEntidad]   = useState('')
  const [desde, setDesde]       = useState('')
  const [hasta, setHasta]       = useState('')
  const [expandido, setExpandido] = useState<number | null>(null)

  const LIMIT = 50

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (nivelArea) params.nivelArea = nivelArea
      if (gradoArea) params.gradoArea = Number(gradoArea)
      if (entidad)   params.entidad   = entidad
      if (desde)     params.desde     = desde
      if (hasta)     params.hasta     = hasta

      const { data } = await getAuditLogs(params)
      setLogs(data.logs)
      setTotal(data.total)
    } catch {
      if (!silent) toast.error('No se pudieron cargar los logs')
    } finally {
      setLoading(false)
    }
  }, [page, nivelArea, gradoArea, entidad, desde, hasta])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647] flex items-center gap-2">
            <FiShield className="text-[#00ACC1]" /> Logs de Auditoría
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {total} registros
            {!isAuditor && user?.areaNivel && (
              <span className="ml-2 text-blue-400 font-medium">
                · {user.areaNivel === 'BASICOS' ? 'Básicos' : 'Diversificados'}
                {user.areaGrado ? ` — ${user.areaGrado}° grado` : ''}
              </span>
            )}
          </p>
        </div>
        <button onClick={() => load()} className="p-2.5 bg-white border border-blue-200 text-[#0E6BA8] rounded-xl hover:bg-blue-50 transition-colors self-start sm:self-auto">
          <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filtros — solo Auditor */}
      {isAuditor && (
        <div className="bg-white/80 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-[#144272] uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FiFilter size={11} /> Filtros
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={nivelArea} onChange={(e) => { setNivelArea(e.target.value); setPage(1) }}
              className="border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1]">
              {NIVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="number" value={gradoArea} onChange={(e) => { setGradoArea(e.target.value); setPage(1) }}
              placeholder="Grado" min={1} max={6}
              className="border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1]" />
            <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1) }}
              className="border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1]" />
            <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1) }}
              className="border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1]" />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-14 text-center">
            <FiLoader className="animate-spin text-[#0E6BA8] mx-auto" size={24} />
            <p className="text-slate-400 text-sm mt-2">Cargando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <FiShield className="mx-auto text-slate-200 mb-2" size={32} />
            <p className="text-slate-400 text-sm">No hay registros de auditoría</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-blue-50">
              {logs.map((l) => {
                const m = METODO_LABEL[l.accion] ?? { label: l.accion, color: 'bg-slate-100 text-slate-600' }
                const d = parseDetalles(l.detalles)
                const abierto = expandido === l.id
                return (
                  <div key={l.id} className="px-4 py-3">
                    <button className="w-full text-left" onClick={() => setExpandido(abierto ? null : l.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                            <span className="text-xs font-semibold text-[#0A2647]">{d?.actor ?? l.carnet ?? `ID:${l.usuarioId ?? '—'}`}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{d?.descripcion ?? `${l.accion} en ${l.entidad}`}</p>
                          {l.ip && <p className="text-[10px] text-slate-400 mt-0.5">{l.ip}</p>}
                        </div>
                        <span className="text-[10px] text-slate-300 shrink-0 tabular-nums">
                          {new Date(l.fecha).toLocaleString('es-GT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    </button>
                    {abierto && (
                      <div className="mt-2 bg-[#F8FBFF] border border-blue-100 rounded-lg p-2.5 text-[11px] text-slate-500 space-y-1">
                        <p className="font-semibold text-[#144272] uppercase tracking-wide text-[10px]">Detalle técnico</p>
                        <p><span className="font-semibold text-[#144272]">Entidad:</span> {l.entidad}{l.entidadId ? ` #${l.entidadId}` : ''}</p>
                        <p><span className="font-semibold text-[#144272]">Ruta:</span> <span className="font-mono">{d?.ruta ?? '—'}</span></p>
                        {d?.cambios && Object.keys(d.cambios).length > 0 && (
                          <pre className="whitespace-pre-wrap break-all font-mono text-[10px] bg-white border border-blue-50 rounded p-2 mt-1">
                            {JSON.stringify(d.cambios, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EBF5FB] border-b border-blue-100">
                    {['', 'Fecha', 'Acción', 'Usuario', 'Qué hizo', 'IP', 'Nivel', 'Grado'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#144272] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => {
                    const m = METODO_LABEL[l.accion] ?? { label: l.accion, color: 'bg-slate-100 text-slate-600' }
                    const d = parseDetalles(l.detalles)
                    const abierto = expandido === l.id
                    const tieneDetalle = !!(d?.ruta || (d?.cambios && Object.keys(d.cambios).length > 0))
                    return (
                      <Fragment key={l.id}>
                        <tr className={`border-b border-blue-50 ${i % 2 !== 0 ? 'bg-[#F8FBFF]' : ''} hover:bg-blue-50/30 ${tieneDetalle ? 'cursor-pointer' : ''}`}
                          onClick={() => tieneDetalle && setExpandido(abierto ? null : l.id)}>
                          <td className="px-2 py-3 text-slate-300">
                            {tieneDetalle && (abierto ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                            {new Date(l.fecha).toLocaleString('es-GT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-[#0A2647] whitespace-nowrap">{d?.actor ?? l.carnet ?? (l.usuarioId ? `ID:${l.usuarioId}` : '—')}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{d?.descripcion ?? `${l.accion} en ${l.entidad}`}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 font-mono">{l.ip ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{l.nivelArea ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{l.gradoArea ?? '—'}</td>
                        </tr>
                        {abierto && tieneDetalle && (
                          <tr className="border-b border-blue-50 bg-[#F8FBFF]">
                            <td colSpan={8} className="px-6 py-3 text-xs text-slate-500 space-y-1.5">
                              <p className="font-semibold text-[#144272] uppercase tracking-wide text-[10px]">Detalle técnico</p>
                              <p><span className="font-semibold text-[#144272]">Entidad:</span> {l.entidad}{l.entidadId ? ` #${l.entidadId}` : ''}</p>
                              <p><span className="font-semibold text-[#144272]">Ruta:</span> <span className="font-mono">{d?.ruta ?? '—'}</span></p>
                              {d?.cambios && Object.keys(d.cambios).length > 0 && (
                                <pre className="whitespace-pre-wrap break-all font-mono text-[11px] bg-white border border-blue-100 rounded-lg p-3">
                                  {JSON.stringify(d.cambios, null, 2)}
                                </pre>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-blue-50 bg-[#EBF5FB]/50">
                <span className="text-xs text-slate-400">{total} total · página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-[#0E6BA8] hover:bg-blue-50 disabled:opacity-40 transition-colors">
                    ← Anterior
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-[#0E6BA8] hover:bg-blue-50 disabled:opacity-40 transition-colors">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
