import { useState } from 'react'
import { FiSearch, FiCheckCircle, FiTrash2, FiFolder } from 'react-icons/fi'
import { getDocumentosEstudiante, verificarDocumento, eliminarDocumento } from '../../../shared/api/documentos'
import toast from 'react-hot-toast'

interface Documento {
  id: number
  tipo: string
  nombreArchivo: string
  descripcion?: string
  verificado: boolean
  subidoEn: string
}

const TIPO_LABELS: Record<string, string> = {
  CARTA_ALERGIA: 'Carta de Alergia',
  CARTA_MEDICA:  'Carta Médica',
  OTRO:          'Otro',
}

export const DocumentosPage = () => {
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(false)
  const [carnet, setCarnet] = useState('')
  const [buscado, setBuscado] = useState('')

  const buscar = () => {
    if (!carnet.trim()) return
    setLoading(true)
    setBuscado(carnet.trim())
    getDocumentosEstudiante(carnet.trim())
      .then((r) => setDocs(r.data))
      .catch(() => { toast.error('Estudiante no encontrado'); setDocs([]) })
      .finally(() => setLoading(false))
  }

  const handleVerificar = async (id: number) => {
    try {
      await verificarDocumento(id)
      setDocs((prev) => prev.map((d) => d.id === id ? { ...d, verificado: true } : d))
      toast.success('Documento verificado')
    } catch { toast.error('Error al verificar') }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await eliminarDocumento(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success('Documento eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A2647]">Documentos Médicos</h1>
        <p className="text-sm text-slate-400 mt-0.5">Busca por carnet para ver y verificar documentos del estudiante</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={carnet} onChange={(e) => setCarnet(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder="Carnet del estudiante..." maxLength={7}
            className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm"
          />
        </div>
        <button onClick={buscar}
          className="bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap">
          Buscar
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400">Buscando...</p>}

      {!loading && buscado && (
        docs.length === 0 ? (
          <div className="text-center py-12">
            <FiFolder size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Sin documentos para el carnet <span className="font-mono font-bold">{buscado}</span></p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 font-medium">{docs.length} documento(s) — carnet <span className="font-mono">{buscado}</span></p>
            {docs.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-blue-50 shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-[#0E6BA8] bg-blue-50 px-2 py-0.5 rounded-full">
                      {TIPO_LABELS[d.tipo] ?? d.tipo}
                    </span>
                    {d.verificado ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <FiCheckCircle size={12} /> Verificado
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold">Pendiente</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#0A2647] truncate">{d.nombreArchivo}</p>
                  {d.descripcion && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{d.descripcion}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(d.subidoEn).toLocaleDateString('es-GT')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!d.verificado && (
                    <button onClick={() => handleVerificar(d.id)}
                      className="text-xs font-semibold text-[#0E6BA8] border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
                      Verificar
                    </button>
                  )}
                  <button onClick={() => handleEliminar(d.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
