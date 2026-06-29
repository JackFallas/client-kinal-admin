import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiBook, FiFilter } from 'react-icons/fi'
import { getSeccionesPanel, createSeccion } from '../../../shared/api/secciones'
import { useAuthStore } from '../../auth/store/authStore'
import { SeccionDetailModal } from './SeccionDetailModal'
import toast from 'react-hot-toast'

interface Seccion {
  id: number
  codigo: string
  nombre: string
  turno: 'MATUTINO' | 'VESPERTINO'
  grado: number
  carrera?: string
  activa: boolean
  nivel: 'BASICOS' | 'DIVERSIFICADOS'
  _count?: { usuarios: number }
}

const EMPTY_FORM = { codigo: '', nombre: '', turno: 'MATUTINO', grado: '1', carrera: '', nivel: 'DIVERSIFICADOS' }

const NIVEL_OPTIONS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'BASICOS', label: 'Básicos' },
  { value: 'DIVERSIFICADOS', label: 'Diversificados' },
]

const TIPO_OPTIONS = [
  { value: '', label: 'Académicas y técnicas' },
  { value: 'academica', label: 'Solo académicas' },
  { value: 'tecnica', label: 'Solo técnicas' },
]

export const SeccionesPage = () => {
  const { user } = useAuthStore()
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [detalleId, setDetalleId] = useState<number | null>(null)

  const [nivel, setNivel] = useState('')
  const [grado, setGrado] = useState('')
  const [tipo, setTipo] = useState('')

  const isAuditor = user?.role === 'AUDITOR'
  // El nivel efectivo (para saber si mostrar el filtro académica/técnica):
  // AUDITOR lo elige con el select; COORDINADOR lo tiene fijo según su área.
  const nivelEfectivo = isAuditor ? nivel : user?.areaNivel

  const load = useCallback(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (isAuditor && nivel) params.nivel = nivel
    if (isAuditor && grado) params.grado = grado
    if (tipo) params.tipo = tipo
    getSeccionesPanel(params as any).then((r) => setSecciones(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [isAuditor, nivel, grado, tipo])

  useEffect(() => { load() }, [load])

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSeccion({
        codigo: form.codigo.toUpperCase(),
        nombre: form.nombre,
        turno: form.turno as 'MATUTINO' | 'VESPERTINO',
        grado: Number(form.grado),
        carrera: form.carrera || undefined,
        nivel: form.nivel as 'BASICOS' | 'DIVERSIFICADOS',
      })
      toast.success('Sección creada')
      setShowModal(false)
      setForm({ ...EMPTY_FORM })
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al crear sección')
    } finally { setSaving(false) }
  }

  const inputCls = "w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm bg-white"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#0A2647]">Secciones</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {secciones.length} secciones registradas
            {!isAuditor && user?.areaNivel && (
              <span className="ml-2 text-blue-400 font-medium">
                · {user.areaNivel === 'BASICOS' ? 'Básicos' : 'Diversificados'}
                {user.areaGrado ? ` — ${user.areaGrado}° grado` : ''}
              </span>
            )}
          </p>
        </div>
        {isAuditor && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all">
            <FiPlus size={16} /> Nueva sección
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white/80 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-[#144272] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FiFilter size={11} /> Filtros
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isAuditor && (
            <>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputCls}>
                {NIVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={grado} onChange={(e) => setGrado(e.target.value)} className={inputCls}>
                <option value="">Todos los grados</option>
                {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g}° grado</option>)}
              </select>
            </>
          )}
          {nivelEfectivo === 'DIVERSIFICADOS' && (
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
              {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : secciones.length === 0 ? (
        <div className="text-center py-16">
          <FiBook size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay secciones registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {secciones.map((s) => (
            <button key={s.id} onClick={() => setDetalleId(s.id)} type="button" className="text-left">
              <div className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md hover:border-[#00ACC1] transition-all cursor-pointer ${!s.activa ? 'opacity-60 border-slate-100' : 'border-blue-50'}`}>
                <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0E6BA8] bg-blue-50 px-2 py-0.5 rounded-full">{s.codigo}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.nivel === 'BASICOS' ? 'bg-teal-50 text-teal-700' : 'bg-purple-50 text-purple-700'}`}>
                      {s.nivel === 'BASICOS' ? 'Básicos' : 'Diversificados'}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.turno === 'MATUTINO' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      {s.turno === 'MATUTINO' ? 'Matutino' : 'Vespertino'}
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-[#0A2647] leading-tight">{s.nombre}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span>Grado {s.grado}</span>
                  {s.carrera && <span>· {s.carrera}</span>}
                  {s._count && <span>· {s._count.usuarios} estudiantes</span>}
                  {!s.activa && <span className="text-red-400 font-medium">· Inactiva</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {detalleId !== null && (
        <SeccionDetailModal seccionId={detalleId} onClose={() => setDetalleId(null)} />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-1">Nueva sección</h2>
              <p className="text-xs text-slate-400 mb-5">
                Académico: <code className="bg-slate-100 px-1 rounded">PE5A</code>
                {'  '}Técnico: <code className="bg-slate-100 px-1 rounded">IN6CM</code>
              </p>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Código *</label>
                    <input type="text" value={form.codigo} onChange={(e) => set('codigo', e.target.value.toUpperCase())} required placeholder="PE5A"
                      className={`${inputCls} font-mono`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Grado *</label>
                    <select value={form.grado} onChange={(e) => set('grado', e.target.value)} required className={inputCls}>
                      {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g}°</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Nombre *</label>
                  <input type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required placeholder="Informática 6to C Matutina" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Turno *</label>
                    <select value={form.turno} onChange={(e) => set('turno', e.target.value)} required className={inputCls}>
                      <option value="MATUTINO">Matutino</option>
                      <option value="VESPERTINO">Vespertino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Nivel *</label>
                    <select value={form.nivel} onChange={(e) => set('nivel', e.target.value)} required className={inputCls}>
                      <option value="BASICOS">Básicos</option>
                      <option value="DIVERSIFICADOS">Diversificados</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Carrera (solo técnicas)</label>
                  <input type="text" value={form.carrera} onChange={(e) => set('carrera', e.target.value)} placeholder="Informática (vacío si es académica)" className={inputCls} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }) }}
                    className="flex-1 border border-blue-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
                    {saving ? 'Creando...' : 'Crear sección'}
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
