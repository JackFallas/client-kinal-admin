import { useEffect, useState } from 'react'
import { FiUsers, FiActivity, FiTrendingUp, FiBell, FiFolder } from 'react-icons/fi'
import { getDashboard } from '../../../shared/api/dashboard'
import { useAuthStore } from '../../auth/store/authStore'

interface DashboardData {
  totalEstudiantes: number
  totalActivos: number
  visitasHoy: number
  visitasSemana: number
  alertasNoLeidas: number
  documentosPendientesVerificar: number
  motivosFrecuentes: { motivo: string; count: number }[]
}

const StatCard = ({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: number; sub?: string; color: string
}) => (
  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-blue-50">
    <div className="flex items-start justify-between mb-3">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide leading-tight">{label}</p>
        {sub && <p className="text-xs text-slate-300 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={17} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-[#0A2647]">{value}</p>
  </div>
)

export const DashboardPage = () => {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const isEnfermero = user?.role === 'ENFERMERO'

  useEffect(() => {
    if (isEnfermero) { setLoading(false); return }
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isEnfermero])

  if (isEnfermero) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#0A2647]">Bienvenido/a, {user?.primerNombre}</h1>
        <p className="text-sm text-slate-400">Usa el menú lateral para registrar visitas o revisar alertas.</p>
      </div>
    )
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando...</p>

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0A2647]">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FiUsers}    label="Estudiantes activos"  value={data?.totalActivos ?? 0}                   color="bg-[#0E6BA8]" />
        <StatCard icon={FiActivity} label="Visitas hoy"          value={data?.visitasHoy ?? 0}                    color="bg-[#00ACC1]" />
        <StatCard icon={FiTrendingUp} label="Visitas (7 días)"   value={data?.visitasSemana ?? 0}                 color="bg-[#26A69A]" />
        <StatCard icon={FiBell}     label="Alertas sin leer"     value={data?.alertasNoLeidas ?? 0}               color="bg-amber-500" />
        <StatCard icon={FiFolder}   label="Docs. por verificar"  value={data?.documentosPendientesVerificar ?? 0} color="bg-blue-500"  />
        <StatCard icon={FiUsers}    label="Total estudiantes" sub="registrados" value={data?.totalEstudiantes ?? 0} color="bg-slate-400" />
      </div>

      {(data?.motivosFrecuentes?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-blue-50 w-full max-w-lg">
          <h2 className="font-semibold text-[#0A2647] mb-4 text-sm">Motivos de visita frecuentes</h2>
          <div className="space-y-3">
            {data!.motivosFrecuentes.map((m, i) => (
              <div key={m.motivo} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 capitalize truncate">{m.motivo}</p>
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00ACC1] rounded-full"
                      style={{ width: `${(m.count / (data!.motivosFrecuentes[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0E6BA8] shrink-0">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
