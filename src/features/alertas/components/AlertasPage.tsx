import { useEffect, useState } from 'react'
import { FiBell, FiCheckCircle } from 'react-icons/fi'
import { getAlertas, marcarAlertaLeida } from '../../../shared/api/alertas'
import toast from 'react-hot-toast'

interface Alerta {
  id: number
  mensaje: string
  leida: boolean
  creadaEn: string
  estudiante: { carnet: string; nombre: string; apellido: string }
  seccion: { codigo: string; nombre: string }
  visita: { motivo: string; fechaHora: string }
}

export const AlertasPage = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'sin-leer' | 'todas'>('sin-leer')

  const load = () => {
    setLoading(true)
    getAlertas(filtro === 'sin-leer' ? { leida: false } : {})
      .then((r) => setAlertas(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filtro])

  const marcar = async (id: number) => {
    try {
      await marcarAlertaLeida(id)
      setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, leida: true } : a))
      toast.success('Alerta marcada como leída')
    } catch { toast.error('Error') }
  }

  const sinLeer = alertas.filter((a) => !a.leida).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#0A2647]">Alertas</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {sinLeer > 0 ? <span className="text-amber-600 font-semibold">{sinLeer} sin leer</span> : 'Todo al día'}
          </p>
        </div>
        <div className="flex bg-white border border-blue-100 rounded-xl overflow-hidden text-sm shadow-sm">
          {(['sin-leer', 'todas'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 font-medium transition-colors ${filtro === f ? 'bg-[#0A2647] text-white' : 'text-slate-500 hover:bg-blue-50'}`}>
              {f === 'sin-leer' ? 'Sin leer' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : alertas.length === 0 ? (
        <div className="text-center py-16">
          <FiBell size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay alertas {filtro === 'sin-leer' ? 'sin leer' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => (
            <div key={a.id} className={`bg-white rounded-xl border shadow-sm p-4 ${!a.leida ? 'border-amber-200 bg-amber-50/30' : 'border-blue-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0E6BA8] bg-blue-50 px-2 py-0.5 rounded-full">{a.seccion.codigo}</span>
                    <span className="text-xs text-slate-400 hidden sm:inline">{a.seccion.nombre}</span>
                    {!a.leida && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Nueva</span>}
                  </div>
                  <p className="font-semibold text-[#0A2647]">{a.mensaje}</p>
                  <p className="text-sm text-slate-500 mt-1 flex flex-wrap gap-1">
                    <span className="font-medium">{a.estudiante.nombre} {a.estudiante.apellido}</span>
                    <span className="text-slate-400 font-mono">({a.estudiante.carnet})</span>
                    <span className="text-slate-400">· {a.visita.motivo}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(a.creadaEn).toLocaleString('es-GT')}</p>
                </div>
                {!a.leida && (
                  <button onClick={() => marcar(a.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#0E6BA8] hover:bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 transition-colors whitespace-nowrap">
                    <FiCheckCircle size={14} /> Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
