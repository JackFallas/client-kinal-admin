import { useEffect, useState } from 'react'
import { FiBell, FiCheckCircle, FiPlus } from 'react-icons/fi'
import { getAlertas, marcarAlertaLeida, enviarAlertaAEnfermeria } from '../../../shared/api/alertas'
import toast from 'react-hot-toast'

interface Alerta {
  id: number
  mensaje: string
  leida: boolean
  creadaEn: string
  destino: 'COORDINADOR_SECCION' | 'ENFERMERO'
  estudiante: { carnet: string; primerNombre: string; primerApellido: string }
  origenUsuario: { primerNombre: string; primerApellido: string; role: string }
  seccion?: { codigo: string; nombre: string } | null
  visita?: { motivo: string; fechaHora: string } | null
}

const ROLE_LABEL: Record<string, string> = {
  AUDITOR: 'Auditor', COORDINADOR: 'Coordinador', ENFERMERO: 'Enfermero', ESTUDIANTE: 'Estudiante',
}

export const AlertasPage = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'sin-leer' | 'todas'>('sin-leer')
  const [showModal, setShowModal] = useState(false)
  const [carnet, setCarnet] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

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

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await enviarAlertaAEnfermeria(carnet.trim(), mensaje.trim())
      toast.success('Alerta enviada a enfermería')
      setShowModal(false)
      setCarnet('')
      setMensaje('')
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al enviar alerta')
    } finally {
      setEnviando(false)
    }
  }

  const sinLeer = alertas.filter((a) => !a.leida).length
  const inputCls = "w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm bg-white"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#0A2647]">Alertas</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {sinLeer > 0 ? <span className="text-amber-600 font-semibold">{sinLeer} sin leer</span> : 'Todo al día'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all">
            <FiPlus size={16} /> Alertar a enfermería
          </button>
          <div className="flex bg-white border border-blue-100 rounded-xl overflow-hidden text-sm shadow-sm">
            {(['sin-leer', 'todas'] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-2 font-medium transition-colors ${filtro === f ? 'bg-[#0A2647] text-white' : 'text-slate-500 hover:bg-blue-50'}`}>
                {f === 'sin-leer' ? 'Sin leer' : 'Todas'}
              </button>
            ))}
          </div>
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
                    {a.seccion ? (
                      <>
                        <span className="text-xs font-bold text-[#0E6BA8] bg-blue-50 px-2 py-0.5 rounded-full">{a.seccion.codigo}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">{a.seccion.nombre}</span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Para enfermería</span>
                    )}
                    {!a.leida && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Nueva</span>}
                  </div>
                  <p className="font-semibold text-[#0A2647]">{a.mensaje}</p>
                  <p className="text-sm text-slate-500 mt-1 flex flex-wrap gap-1">
                    <span className="font-medium">{a.estudiante.primerNombre} {a.estudiante.primerApellido}</span>
                    <span className="text-slate-400 font-mono">({a.estudiante.carnet})</span>
                    {a.visita && <span className="text-slate-400">· {a.visita.motivo}</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Enviado por <span className="font-medium text-slate-500">{a.origenUsuario.primerNombre} {a.origenUsuario.primerApellido}</span>
                    {' '}({ROLE_LABEL[a.origenUsuario.role] ?? a.origenUsuario.role}) · {new Date(a.creadaEn).toLocaleString('es-GT')}
                  </p>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-1">Alertar a enfermería</h2>
              <p className="text-xs text-slate-400 mb-5">Envía un aviso directo al personal de enfermería sobre un estudiante</p>
              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Carnet del estudiante *</label>
                  <input value={carnet} onChange={(e) => setCarnet(e.target.value)} required placeholder="2023001" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Mensaje *</label>
                  <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} required rows={3}
                    placeholder="Describe la situación..."
                    className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent resize-none shadow-sm" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-blue-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={enviando}
                    className="flex-1 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                    {enviando ? 'Enviando...' : 'Enviar alerta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
