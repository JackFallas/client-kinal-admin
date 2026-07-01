import { useEffect, useState } from 'react'
import { FiSearch, FiActivity } from 'react-icons/fi'
import { getVisitas } from '../../../shared/api/visitas'

interface Visita {
  id: number
  motivo: string
  descripcion?: string
  temperatura?: number
  requiereRetirarse?: boolean
  fechaHora: string
  estudiante: { carnet: string; primerNombre: string; primerApellido: string; seccion?: { codigo: string } }
  alerta?: { mensaje: string; leida: boolean } | null
}

export const VisitasPage = () => {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const load = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (desde) params.desde = desde
    if (hasta) params.hasta = hasta
    getVisitas(params).then((r) => setVisitas(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = visitas.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.estudiante?.carnet.includes(q) || v.estudiante?.primerNombre.toLowerCase().includes(q) || v.motivo.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#0A2647]">Historial de Visitas</h1>
          <p className="text-sm text-slate-400 mt-0.5">{visitas.length} registros</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por carnet, nombre o motivo..."
            className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm" />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
            className="flex-1 sm:flex-none border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] shadow-sm min-w-0" />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
            className="flex-1 sm:flex-none border border-blue-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00ACC1] shadow-sm min-w-0" />
          <button onClick={load}
            className="bg-[#0A2647] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#144272] transition-colors shadow-sm whitespace-nowrap">
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiActivity size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay visitas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.id} className="bg-white rounded-xl border border-blue-50 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#0A2647]">
                      {v.estudiante.primerNombre} {v.estudiante.primerApellido}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{v.estudiante.carnet}</span>
                    {v.estudiante.seccion && (
                      <span className="text-xs bg-blue-50 text-[#0E6BA8] font-semibold px-2 py-0.5 rounded-full">
                        {v.estudiante.seccion.codigo}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[#144272] capitalize">{v.motivo}</p>
                  {v.descripcion && <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{v.descripcion}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                    {v.temperatura && <span>🌡 {v.temperatura}°C</span>}
                    {v.requiereRetirarse && <span className="text-amber-600 font-medium">🚸 Requirió retirarse</span>}
                    <span>{new Date(v.fechaHora).toLocaleString('es-GT')}</span>
                  </div>
                </div>
                {v.alerta && (
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium ${v.alerta.leida ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-700'}`}>
                    {v.alerta.leida ? 'Leída' : '⚠ Alerta'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
