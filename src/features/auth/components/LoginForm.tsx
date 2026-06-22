import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiLock, FiEye, FiEyeOff, FiShield, FiUsers,
  FiActivity, FiLoader, FiAlertTriangle, FiMail,
} from 'react-icons/fi'
import imgLogo from '../../../assets/img/GESAPLogo.svg'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const features = [
  { icon: FiUsers,    text: 'Gestión de estudiantes y secciones por carnet' },
  { icon: FiActivity, text: 'Registro y seguimiento de visitas de enfermería' },
  { icon: FiShield,   text: 'Acceso seguro para personal autorizado' },
]

const ROLE_LABELS: Record<string, string> = {
  AUDITOR:     'Auditor',
  COORDINADOR: 'Coordinador',
  ENFERMERO:   'Enfermero/a',
}

export const LoginForm = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const wasKicked = new URLSearchParams(window.location.search).get('kicked') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
    if (useAuthStore.getState().isAuthenticated) {
      toast.success('Bienvenido al portal administrativo')
      navigate('/portal')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] relative flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-[#00ACC1]/20" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <img src={imgLogo} alt="GESAP" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">GESAP Kinal</h1>
              <p className="text-blue-300 text-sm font-medium">Portal Administrativo</p>
            </div>
          </div>

          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Enfermería escolar,<br />
            <span className="text-[#26C6DA]">digitalizada</span>
          </h2>
            <p className="text-blue-200 text-base mb-10 leading-relaxed">
            Plataforma para coordinadores y enfermeros del Instituto Kinal. Gestiona estudiantes, visitas de enfermería y alertas por sección.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00ACC1]/20 border border-[#00ACC1]/30 flex items-center justify-center shrink-0">
                  <Icon className="text-[#26C6DA]" size={16} />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-2/5 bg-[#EBF5FB] flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-[#0A2647] p-3 rounded-xl">
              <img src={imgLogo} alt="GESAP" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-[#0A2647] font-bold text-xl">GESAP Kinal</h1>
              <p className="text-blue-500 text-xs">Portal Administrativo</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[#0A2647] text-2xl font-bold">Iniciar Sesión</h2>
            <p className="text-slate-500 text-sm mt-1">Acceso para personal del Instituto Kinal</p>
          </div>

          {wasKicked && (
            <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 flex items-start gap-2.5">
              <FiAlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">Sesión cerrada.</strong>{' '}
                Un administrador del sistema ha cerrado tu sesión activa. Por favor inicia sesión nuevamente.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#144272] mb-2 uppercase tracking-wide">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="text-[#0E6BA8]" size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@kinal.edu.gt"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-blue-200 rounded-xl
                    text-[#0A2647] placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#144272] mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiLock className="text-[#0E6BA8]" size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-blue-200 rounded-xl
                    text-[#0A2647] placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0E6BA8] transition-colors"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1]
                text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/25
                transition-all duration-200 hover:shadow-xl active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><FiLoader className="animate-spin" size={16} /> Verificando...</>
                : 'Iniciar Sesión'
              }
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-10">
            © 2026 Jack Fallas · GESAP Kinal
          </p>
        </div>
      </div>
    </div>
  )
}
