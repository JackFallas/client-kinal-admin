import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiLock, FiEye, FiEyeOff, FiShield, FiUsers,
  FiActivity, FiLoader, FiAlertTriangle, FiMail, FiArrowLeft, FiUser, FiPlus, FiCheck,
} from 'react-icons/fi'
import imgLogo from '../../../assets/img/GESAPLogo.svg'
import { useAuthStore } from '../store/authStore'
import { verificarEmailApi, type PerfilPreview } from '../../../shared/api/auth'
import toast from 'react-hot-toast'

const features = [
  { icon: FiUsers,    text: 'Gestión de estudiantes y secciones por carnet' },
  { icon: FiActivity, text: 'Registro y seguimiento de visitas de enfermería' },
  { icon: FiShield,   text: 'Acceso seguro para personal autorizado' },
]

type Paso = 'picker' | 'email' | 'password'

export const LoginForm = () => {
  const { perfilRecordado } = useAuthStore()
  const [paso, setPaso]         = useState<Paso>(perfilRecordado ? 'picker' : 'email')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [errorEmail, setErrorEmail]   = useState('')
  const [preview, setPreview]   = useState<PerfilPreview | null>(null)
  const { login, loading, error, olvidarPerfil } = useAuthStore()
  const navigate = useNavigate()

  const wasKicked = new URLSearchParams(window.location.search).get('kicked') === 'true'

  const irAPaso = (destino: Paso) => setPaso(destino)

  // Clic en la tarjeta del perfil recordado — ya tenemos nombre/foto, solo falta la contraseña
  const handleElegirPerfil = () => {
    if (!perfilRecordado) return
    setEmail(perfilRecordado.email)
    setPassword('')
    setPreview({ nombre: perfilRecordado.nombre, fotoPerfil: perfilRecordado.fotoPerfil, role: 'COORDINADOR' })
    irAPaso('password')
  }

  // Clic en "+" — muestra el login en blanco sin borrar el perfil recordado (sigue disponible si recarga)
  const handleOtraCuentaDesdePicker = () => {
    setPreview(null)
    setEmail('')
    setPassword('')
    irAPaso('email')
  }

  const handleSiguiente = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorEmail('')
    setVerificando(true)
    try {
      const { data } = await verificarEmailApi(email)
      setPreview(data)
      irAPaso('password')
    } catch {
      setErrorEmail('No encontramos una cuenta con ese correo')
    } finally {
      setVerificando(false)
    }
  }

  // Volver desde el paso de contraseña: si hay perfil recordado, regresa al selector (sin borrarlo);
  // si se llegó escribiendo el correo a mano, vuelve al formulario en blanco.
  const handleVolver = () => {
    setPreview(null)
    setPassword('')
    if (perfilRecordado) {
      setEmail('')
      irAPaso('picker')
    } else {
      setEmail('')
      irAPaso('email')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password, preview?.role !== 'AUDITOR' && recordar)
    if (useAuthStore.getState().isAuthenticated) {
      toast.success('Bienvenido al portal administrativo')
      navigate('/portal')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] relative flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blob-drift" style={{ animationDuration: '16s' }} />
        <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-[#00ACC1]/20 blob-drift" style={{ animationDuration: '12s', animationDelay: '-3s', animationDirection: 'reverse' }} />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-white/5 blob-drift" style={{ animationDuration: '20s', animationDelay: '-8s' }} />
        <div className="absolute top-10 right-1/4 w-40 h-40 rounded-full bg-[#26C6DA]/10 blob-drift" style={{ animationDuration: '10s', animationDelay: '-5s', animationDirection: 'reverse' }} />

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

          <h2 className="text-white font-bold leading-tight mb-4 text-center">
            <span className="block text-2xl whitespace-nowrap">Gestor De Salud Privada</span>
            <span className="block text-4xl text-[#26C6DA] mt-1">Kinal</span>
          </h2>
          <p className="text-blue-200 text-base mb-10 leading-relaxed text-justify max-w-sm mx-auto">
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
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="bg-[#0A2647] p-3 rounded-xl">
              <img src={imgLogo} alt="GESAP" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-[#0A2647] font-bold text-xl">GESAP Kinal</h1>
              <p className="text-blue-500 text-xs">Portal Administrativo</p>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-[#0A2647] text-3xl font-bold">Iniciar Sesión</h2>
            <p className="text-slate-500 text-base mt-1.5">Acceso para personal del Instituto Kinal</p>
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
              {error.toLowerCase().includes('verificar') && (
                <Link to="/verificar-cuenta" className="block mt-1.5 font-semibold underline">
                  Verificar mi cuenta ahora
                </Link>
              )}
            </div>
          )}

          <div key={paso} className="min-h-[400px] flex flex-col justify-center">
            {paso === 'picker' && perfilRecordado ? (
              <div className="text-center step-enter">
                <div className="flex items-start gap-6 justify-center">
                  <button type="button" onClick={handleElegirPerfil}
                    style={{ animationDelay: '0ms' }} className="pop-enter flex flex-col items-center gap-3.5 group w-36">
                    <div className="float-idle">
                      {perfilRecordado.fotoPerfil ? (
                        <img src={perfilRecordado.fotoPerfil} alt="" className="w-32 h-32 rounded-full object-cover shadow-md ring-4 ring-white group-hover:ring-[#00ACC1] group-hover:scale-105 transition-all duration-200 group-active:scale-95" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center shadow-md ring-4 ring-white group-hover:ring-[#00ACC1] group-hover:scale-105 transition-all duration-200 group-active:scale-95">
                          <FiUser className="text-white" size={48} />
                        </div>
                      )}
                    </div>
                    <p className="text-base font-semibold text-[#0A2647] text-center leading-tight">{perfilRecordado.nombre}</p>
                  </button>

                  <button type="button" onClick={handleOtraCuentaDesdePicker}
                    style={{ animationDelay: '130ms' }} className="pop-enter flex flex-col items-center gap-3.5 group w-36">
                    <div className="float-idle" style={{ animationDelay: '0.4s' }}>
                      <div className="w-32 h-32 rounded-full bg-white border-2 border-dashed border-blue-200 flex items-center justify-center shadow-sm group-hover:border-[#00ACC1] group-hover:scale-105 transition-all duration-200 group-active:scale-95">
                        <FiPlus className="text-[#0E6BA8]" size={38} />
                      </div>
                    </div>
                    <p className="text-base font-medium text-slate-500 text-center leading-tight">Otra cuenta</p>
                  </button>
                </div>
                <button type="button" onClick={() => { olvidarPerfil(); irAPaso('email') }}
                  style={{ animationDelay: '260ms' }} className="step-enter-item text-xs text-slate-400 hover:text-slate-600 hover:underline mt-5">
                  Olvidar este perfil
                </button>
              </div>
            ) : paso === 'email' ? (
              <form onSubmit={handleSiguiente} className="space-y-5 step-enter">
                {perfilRecordado && (
                  <button type="button" onClick={() => irAPaso('picker')} aria-label="Volver"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-[#0E6BA8] hover:bg-blue-100 transition-colors mb-6 -ml-1">
                    <FiArrowLeft size={18} />
                  </button>
                )}
                <div className="step-enter-item" style={{ animationDelay: '0ms' }}>
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
                      onChange={(e) => { setEmail(e.target.value); setErrorEmail('') }}
                      placeholder="usuario@kinal.edu.gt"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-blue-200 rounded-xl
                        text-[#0A2647] placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                  {errorEmail && <p className="text-xs text-red-600 mt-1.5">{errorEmail}</p>}
                </div>

                <button
                  type="submit"
                  disabled={verificando}
                  style={{ animationDelay: '70ms' }}
                  className="step-enter-item w-full py-3 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1]
                    text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/25
                    transition-all duration-200 hover:shadow-xl active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verificando
                    ? <><FiLoader className="animate-spin" size={16} /> Verificando...</>
                    : 'Siguiente'
                  }
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 step-enter">
                <button type="button" onClick={handleVolver} aria-label="Volver"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[#0E6BA8] hover:bg-blue-100 transition-colors mb-6 -ml-1">
                  <FiArrowLeft size={18} />
                </button>

                <div className="step-enter-item flex flex-col items-center gap-3 py-2" style={{ animationDelay: '0ms' }}>
                  {preview?.fotoPerfil ? (
                    <img src={preview.fotoPerfil} alt="" className="w-20 h-20 rounded-full object-cover shadow-md ring-4 ring-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center shadow-md ring-4 ring-white">
                      <FiUser className="text-white" size={32} />
                    </div>
                  )}
                  <p className="text-base font-semibold text-[#0A2647]">{preview?.nombre ?? email}</p>
                </div>

                <div className="step-enter-item" style={{ animationDelay: '60ms' }}>
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
                      autoFocus
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
                  <div className="text-right mt-1.5">
                    <Link to="/olvide-password" className="text-xs text-[#0E6BA8] font-semibold hover:underline">¿Olvidaste tu contraseña?</Link>
                  </div>
                </div>

                {preview?.role !== 'AUDITOR' && (
                  <label className="step-enter-item flex items-center gap-2.5 text-xs text-slate-500 cursor-pointer select-none" style={{ animationDelay: '110ms' }}>
                    <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
                      <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} className="sr-only" />
                      <span className={`absolute inset-0 rounded-md border-2 transition-all duration-200 ${recordar ? 'bg-[#0E6BA8] border-[#0E6BA8]' : 'bg-white border-blue-300'}`} />
                      <FiCheck size={13} strokeWidth={3}
                        className={`relative text-white transition-all duration-200 ${recordar ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-12'}`} />
                    </span>
                    Recordar sesión en este dispositivo (15 días)
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ animationDelay: '150ms' }}
                  className="step-enter-item w-full py-3 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1]
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
            )}
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            ¿Eres estudiante?{' '}
            <a href="https://kinal.gesap.lat" className="text-[#0E6BA8] font-semibold hover:underline">Portal del estudiante</a>
          </p>
          <p className="text-center text-xs text-slate-400 mt-2">
            ¿No has verificado tu cuenta?{' '}
            <Link to="/verificar-cuenta" className="text-[#0E6BA8] font-semibold hover:underline">Verifícala aquí</Link>
          </p>
          <p className="text-center text-slate-400 text-xs mt-4">
            © 2026 Jack Fallas · GESAP Kinal
          </p>
        </div>
      </div>
    </div>
  )
}
