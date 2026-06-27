import { useState, useEffect, useCallback, useRef } from 'react'
import { FiActivity, FiLoader, FiRefreshCw, FiLogOut, FiWifi } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getSesionesActivas, kickSesion } from '../../../shared/api/sesiones'
import { useAuthStore } from '../../auth/store/authStore'

interface Sesion {
  id: number
  usuarioId: number
  ipAddress?: string
  userAgent?: string
  loginAt: string
  lastActiveAt: string
  usuario: {
    id: number
    primerNombre: string
    primerApellido: string
    email: string
    role: string
    seccion?: { codigo: string; nombre: string } | null
  }
}

const ROLE_LABELS: Record<string, string> = {
  AUDITOR:     'Auditor',
  COORDINADOR: 'Coordinador',
  ENFERMERO:   'Enfermero',
  ESTUDIANTE:  'Estudiante',
}

const ROLE_COLORS: Record<string, string> = {
  AUDITOR:     'bg-purple-100 text-purple-700',
  COORDINADOR: 'bg-blue-50 text-[#0E6BA8]',
  ENFERMERO:   'bg-cyan-50 text-cyan-700',
  ESTUDIANTE:  'bg-slate-100 text-slate-600',
}

const actividadInfo = (lastActive: string) => {
  const mins = (Date.now() - new Date(lastActive).getTime()) / 60_000
  if (mins < 5)  return { dot: 'bg-emerald-500', label: 'Activo',   text: 'text-emerald-600', pulse: true  }
  if (mins < 15) return { dot: 'bg-amber-400',   label: 'Inactivo', text: 'text-amber-600',   pulse: false }
  return           { dot: 'bg-slate-400',        label: 'Offline',  text: 'text-slate-400',   pulse: false }
}

const initials = (nombre: string, apellido: string) =>
  `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase()

export const SesionesPage = () => {
  const { user } = useAuthStore()
  const [sesiones, setSesiones]     = useState<Sesion[]>([])
  const [loading, setLoading]       = useState(true)
  const [kicking, setKicking]       = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSesiones = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await getSesionesActivas()
      setSesiones(data)
      setLastUpdate(new Date())
      setSecondsAgo(0)
    } catch {
      if (!silent) toast.error('No se pudieron cargar las sesiones activas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSesiones()
    const interval = setInterval(() => fetchSesiones(true), 8_000)
    return () => clearInterval(interval)
  }, [fetchSesiones])

  useEffect(() => {
    if (!lastUpdate) return
    timerRef.current = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdate.getTime()) / 1000))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [lastUpdate])

  const handleKick = async (s: Sesion) => {
    if (!confirm(`¿Cerrar sesión de ${s.usuario.primerNombre} ${s.usuario.primerApellido}?`)) return
    setKicking(s.id)
    try {
      await kickSesion(s.id)
      setSesiones((prev) => prev.filter((x) => x.id !== s.id))
      toast.success('Sesión cerrada')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al cerrar sesión')
    } finally {
      setKicking(null)
    }
  }

  const currentUserId = user?.id

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A2647] flex items-center gap-2">
            <FiActivity className="text-[#00ACC1]" /> Sesiones Activas
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {sesiones.length} {sesiones.length === 1 ? 'sesión activa' : 'sesiones activas'}
            {lastUpdate && (
              <span className="ml-2 text-slate-400">· Actualizado hace {secondsAgo}s</span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchSesiones()}
          className="p-2.5 bg-white border border-blue-200 text-[#0E6BA8] rounded-xl hover:bg-blue-50 transition-colors self-start sm:self-auto"
          title="Actualizar"
        >
          <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 bg-white/80 border border-blue-100 rounded-xl px-4 py-2.5">
        <span className="font-semibold text-[#144272]">Última actividad:</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt; 5 min</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> 5–15 min</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> &gt; 15 min</span>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Vista móvil — tarjetas */}
        <div className="md:hidden">
          {loading ? (
            <div className="py-14 text-center">
              <FiLoader className="animate-spin text-[#0E6BA8] mx-auto" size={24} />
              <p className="text-slate-400 text-sm mt-2">Cargando sesiones...</p>
            </div>
          ) : sesiones.length === 0 ? (
            <div className="py-12 text-center px-4">
              <FiWifi className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-400 text-sm font-medium">No hay sesiones activas</p>
              <p className="text-slate-300 text-xs mt-1">Las sesiones aparecen cuando los usuarios inician sesión</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {sesiones.map((s) => {
                const isSelf = s.usuarioId === currentUserId
                const status = actividadInfo(s.lastActiveAt)
                return (
                  <div key={s.id} className={`px-4 py-3.5 ${isSelf ? 'bg-blue-50/60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                        {initials(s.usuario.primerNombre, s.usuario.primerApellido)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[#0A2647] text-sm">{s.usuario.primerNombre} {s.usuario.primerApellido}</p>
                          {isSelf && <span className="text-[10px] text-blue-400 font-medium">Tu sesión</span>}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{s.usuario.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[s.usuario.role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ROLE_LABELS[s.usuario.role] ?? s.usuario.role}
                          </span>
                          {s.usuario.seccion && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0E6BA8]">
                              {s.usuario.seccion.codigo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                          <span className="font-mono">{s.ipAddress ?? '—'}</span>
                          <span>{new Date(s.loginAt).toLocaleString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {!isSelf && (
                        <button
                          onClick={() => handleKick(s)}
                          disabled={kicking === s.id}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                        >
                          <FiLogOut size={13} /> {kicking === s.id ? '...' : 'Cerrar'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vista escritorio — tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EBF5FB] border-b border-blue-100">
                {['Estado', 'Usuario', 'Rol', 'Sección', 'IP', 'Inicio sesión', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#144272] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <FiLoader className="animate-spin text-[#0E6BA8] mx-auto" size={24} />
                    <p className="text-slate-400 text-sm mt-2">Cargando sesiones...</p>
                  </td>
                </tr>
              ) : sesiones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <FiWifi className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-slate-400 text-sm font-medium">No hay sesiones activas</p>
                    <p className="text-slate-300 text-xs mt-1">Las sesiones aparecen cuando los usuarios inician sesión</p>
                  </td>
                </tr>
              ) : (
                sesiones.map((s, i) => {
                  const isSelf = s.usuarioId === currentUserId
                  const status = actividadInfo(s.lastActiveAt)
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-blue-50 transition-colors ${
                        isSelf ? 'bg-blue-50/60' : i % 2 !== 0 ? 'bg-[#F8FBFF] hover:bg-blue-50/30' : 'hover:bg-blue-50/30'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
                          <span className={`w-2 h-2 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {initials(s.usuario.primerNombre, s.usuario.primerApellido)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0A2647] text-xs">{s.usuario.primerNombre} {s.usuario.primerApellido}</p>
                            <p className="text-slate-400 text-[10px]">{s.usuario.email}</p>
                            {isSelf && <span className="text-[10px] text-blue-400 font-medium">Tu sesión</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[s.usuario.role] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ROLE_LABELS[s.usuario.role] ?? s.usuario.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {s.usuario.seccion ? (
                          <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0E6BA8]">
                            {s.usuario.seccion.codigo}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">
                        {s.ipAddress ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {new Date(s.loginAt).toLocaleString('es-GT', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        {isSelf ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : (
                          <button
                            onClick={() => handleKick(s)}
                            disabled={kicking === s.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FiLogOut size={13} /> {kicking === s.id ? 'Cerrando...' : 'Cerrar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#EBF5FB]/50 border-t border-blue-100">
          <span className="text-xs text-slate-400">{sesiones.length} {sesiones.length === 1 ? 'sesión activa' : 'sesiones activas'} en el sistema</span>
        </div>
      </div>
    </div>
  )
}
