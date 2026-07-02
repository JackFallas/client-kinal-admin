import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiCheckCircle, FiTrash2, FiFolder, FiEye, FiX, FiExternalLink, FiUpload, FiFileText } from 'react-icons/fi'
import {
  getDocumentosEstudiante, getDocumentosPorArea, getArchivoDocumento, eliminarDocumento,
  listarPlantillas, subirPlantilla, getArchivoPlantilla,
} from '../../../shared/api/documentos'
import { useAuthStore } from '../../auth/store/authStore'
import toast from 'react-hot-toast'

interface Documento {
  id: number
  tipo: string
  nombreArchivo: string
  descripcion?: string
  verificado: boolean
  subidoEn: string
  estudiante?: {
    carnet: string
    primerNombre: string
    primerApellido: string
    seccion?: { codigo: string; nombre: string } | null
  }
}

interface Plantilla {
  id: number
  tipo: string
  nombreArchivo: string
  subidoEn: string
}

const TIPO_LABELS: Record<string, string> = {
  CARTA_ALERGIA: 'Carta de Alergia',
  CARTA_MEDICA:  'Carta Médica',
  OTRO:          'Otro',
}

const TIPOS: Array<keyof typeof TIPO_LABELS> = ['CARTA_ALERGIA', 'CARTA_MEDICA', 'OTRO']

export const DocumentosPage = () => {
  const { user } = useAuthStore()
  const isAuditor = user?.role === 'AUDITOR'

  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [carnet, setCarnet] = useState('')
  const [buscado, setBuscado] = useState('')

  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [subiendoTipo, setSubiendoTipo] = useState<string | null>(null)

  const [preview, setPreview] = useState<{ id: number; nombre: string; url: string; tipo: 'pdf' | 'imagen' } | null>(null)

  const cargarPorArea = useCallback(() => {
    setLoading(true)
    setBuscado('')
    getDocumentosPorArea()
      .then((r) => setDocs(r.data))
      .catch(() => toast.error('No se pudieron cargar los documentos'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargarPorArea() }, [cargarPorArea])
  useEffect(() => {
    listarPlantillas().then((r) => setPlantillas(r.data)).catch(() => {})
  }, [])

  const buscar = () => {
    if (!carnet.trim()) return
    setLoading(true)
    setBuscado(carnet.trim())
    getDocumentosEstudiante(carnet.trim())
      .then((r) => setDocs(r.data))
      .catch(() => { toast.error('Estudiante no encontrado'); setDocs([]) })
      .finally(() => setLoading(false))
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await eliminarDocumento(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success('Documento eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  const abrirPreview = async (doc: Documento) => {
    try {
      const { data } = await getArchivoDocumento(doc.id)
      const esImagen = /\.(jpg|jpeg|png)$/i.test(doc.nombreArchivo)
      const url = URL.createObjectURL(data)
      setPreview({ id: doc.id, nombre: doc.nombreArchivo, url, tipo: esImagen ? 'imagen' : 'pdf' })
    } catch {
      toast.error('No se pudo cargar el archivo')
    }
  }

  const cerrarPreview = () => {
    if (preview) URL.revokeObjectURL(preview.url)
    setPreview(null)
  }

  const handleSubirPlantilla = async (tipo: string, file: File) => {
    setSubiendoTipo(tipo)
    const fd = new FormData()
    fd.append('archivo', file)
    try {
      const { data } = await subirPlantilla(tipo, fd)
      setPlantillas((prev) => [...prev.filter((p) => p.tipo !== tipo), data])
      toast.success('Plantilla actualizada')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al subir la plantilla')
    } finally {
      setSubiendoTipo(null)
    }
  }

  const verPlantilla = async (tipo: string) => {
    try {
      const { data } = await getArchivoPlantilla(tipo)
      window.open(URL.createObjectURL(data), '_blank')
    } catch {
      toast.error('No se pudo abrir la plantilla')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0A2647]">Documentos Médicos</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {buscado ? <>Resultados para el carnet <span className="font-mono">{buscado}</span></> : isAuditor ? 'Todos los estudiantes' : 'Estudiantes de tu área'}
        </p>
      </div>

      {/* Plantillas */}
      <div className="bg-white/80 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#144272] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FiFileText size={12} /> Plantillas descargables
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {TIPOS.map((tipo) => {
            const plantilla = plantillas.find((p) => p.tipo === tipo)
            return (
              <div key={tipo} className="border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-[#0A2647] mb-1">{TIPO_LABELS[tipo]}</p>
                {plantilla ? (
                  <button onClick={() => verPlantilla(tipo)} className="text-xs text-[#0E6BA8] hover:underline truncate block max-w-full text-left">
                    {plantilla.nombreArchivo}
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">Sin plantilla subida</p>
                )}
                <label className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#0E6BA8] cursor-pointer hover:underline w-fit">
                  <FiUpload size={12} /> {subiendoTipo === tipo ? 'Subiendo...' : plantilla ? 'Reemplazar' : 'Subir'}
                  <input type="file" accept=".doc,.docx,.pdf" className="hidden" disabled={subiendoTipo === tipo}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirPlantilla(tipo, f); e.target.value = '' }} />
                </label>
              </div>
            )
          })}
        </div>
      </div>

      {/* Búsqueda por carnet */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={carnet} onChange={(e) => setCarnet(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder="Buscar por carnet..." maxLength={7}
            className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm"
          />
        </div>
        <button onClick={buscar}
          className="bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap">
          Buscar
        </button>
        {buscado && (
          <button onClick={cargarPorArea} className="text-sm font-semibold text-[#0E6BA8] hover:underline whitespace-nowrap">
            ← Ver todos
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}

      {!loading && (
        docs.length === 0 ? (
          <div className="text-center py-12">
            <FiFolder size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {buscado ? <>Sin documentos para el carnet <span className="font-mono font-bold">{buscado}</span></> : 'No hay documentos para mostrar'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 font-medium">{docs.length} documento(s)</p>
            {docs.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-blue-50 shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {d.estudiante && (
                      <span className="text-xs font-semibold text-[#0A2647]">
                        {d.estudiante.primerNombre} {d.estudiante.primerApellido} · <span className="font-mono">{d.estudiante.carnet}</span>
                        {d.estudiante.seccion && ` · ${d.estudiante.seccion.codigo}`}
                      </span>
                    )}
                  </div>
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
                  <button onClick={() => abrirPreview(d)}
                    className="text-xs font-semibold text-[#0E6BA8] border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                    <FiEye size={14} /> Ver
                  </button>
                  <button onClick={() => handleEliminar(d.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de vista previa */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={cerrarPreview}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-blue-50">
              <p className="font-semibold text-[#0A2647] text-sm truncate">{preview.nombre}</p>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => window.open(preview.url, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0E6BA8] hover:underline">
                  <FiExternalLink size={13} /> Abrir en otra pestaña
                </button>
                <button onClick={cerrarPreview} className="text-slate-400 hover:text-slate-600">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50">
              {preview.tipo === 'imagen' ? (
                <img src={preview.url} alt={preview.nombre} className="max-w-full mx-auto" />
              ) : (
                <iframe src={preview.url} title={preview.nombre} className="w-full h-full border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
