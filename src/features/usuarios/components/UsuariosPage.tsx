import { useEffect, useState } from 'react'
import { FiUserPlus, FiSearch, FiSlash, FiUsers } from 'react-icons/fi'
import { getUsuarios, createUsuario, toggleUsuarioActivo } from '../../../shared/api/usuarios'
import { getSecciones } from '../../../shared/api/secciones'
import { useAuthStore } from '../../auth/store/authStore'
import toast from 'react-hot-toast'

interface Usuario {
  id: number
  carnet: string
  nombre: string
  apellido: string
  email?: string
  role: string
  activo: boolean
  seccion?: { codigo: string }
}

interface Seccion { id: number; codigo: string; nombre: string }

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

const EMPTY_FORM = { carnet: '', nombre: '', apellido: '', email: '', password: '', role: 'ESTUDIANTE', seccionId: '' }

export const UsuariosPage = () => {
  const { user } = useAuthStore()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const isCoord = user?.role === 'COORDINADOR' || user?.role === 'AUDITOR'

  const load = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (roleFilter) params.role = roleFilter
    getUsuarios(params).then((r) => setUsuarios(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [roleFilter])
  useEffect(() => { getSecciones().then((r) => setSecciones(r.data)).catch(() => {}) }, [])

  const filtered = usuarios.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.carnet.includes(q) || u.nombre.toLowerCase().includes(q) || u.apellido.toLowerCase().includes(q)
  })

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createUsuario({
        carnet: form.carnet,
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
        seccionId: form.seccionId ? Number(form.seccionId) : undefined,
      })
      toast.success('Usuario creado')
      setShowModal(false)
      setForm({ ...EMPTY_FORM })
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al crear usuario')
    } finally { setSaving(false) }
  }

  const handleToggle = async (carnet: string, activo: boolean) => {
    if (!confirm(`¿Deseas ${activo ? 'desactivar' : 'activar'} este usuario?`)) return
    try {
      await toggleUsuarioActivo(carnet, !activo)
      setUsuarios((prev) => prev.map((u) => u.carnet === carnet ? { ...u, activo: !activo } : u))
      toast.success(`Usuario ${activo ? 'desactivado' : 'activado'}`)
    } catch { toast.error('Error al actualizar') }
  }

  const inputCls = "w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm bg-white"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#0A2647]">Usuarios</h1>
          <p className="text-sm text-slate-400 mt-0.5">{usuarios.length} registros</p>
        </div>
        {isCoord && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all">
            <FiUserPlus size={16} /> Nuevo usuario
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por carnet o nombre..."
            className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] shadow-sm">
          <option value="">Todos los roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiUsers size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay usuarios</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between gap-3 ${!u.activo ? 'opacity-60 border-slate-100' : 'border-blue-50'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold text-[#0A2647] truncate">{u.nombre} {u.apellido}</span>
                  <span className="text-xs text-slate-400 font-mono shrink-0">{u.carnet}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  {!u.activo && <span className="text-xs font-semibold text-red-500 shrink-0">Inactivo</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  {u.email && <span className="truncate max-w-[160px] sm:max-w-none">{u.email}</span>}
                  {u.seccion && <span className="bg-blue-50 text-[#0E6BA8] font-semibold px-2 py-0.5 rounded-full shrink-0">{u.seccion.codigo}</span>}
                </div>
              </div>
              {isCoord && (
                <button onClick={() => handleToggle(u.carnet, u.activo)}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${u.activo ? 'text-red-500 hover:bg-red-50 border-red-200' : 'text-[#0E6BA8] hover:bg-blue-50 border-blue-200'}`}>
                  <FiSlash size={13} /> {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#0A2647] mb-5">Nuevo usuario</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Carnet *</label>
                    <input type="text" value={form.carnet} onChange={(e) => set('carnet', e.target.value)} maxLength={7} required placeholder="2024001" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Rol *</label>
                    <select value={form.role} onChange={(e) => set('role', e.target.value)} required className={inputCls}>
                      {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Nombre *</label>
                    <input type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Apellido *</label>
                    <input type="text" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Email institucional</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="usuario@kinal.edu.gt" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Contraseña *</label>
                  <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} className={inputCls} />
                </div>
                {form.role === 'ESTUDIANTE' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Sección</label>
                    <select value={form.seccionId} onChange={(e) => set('seccionId', e.target.value)} className={inputCls}>
                      <option value="">Sin sección</option>
                      {secciones.map((s) => <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm({ ...EMPTY_FORM }) }}
                    className="flex-1 border border-blue-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
                    {saving ? 'Creando...' : 'Crear usuario'}
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
