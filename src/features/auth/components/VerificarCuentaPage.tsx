import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiMail } from 'react-icons/fi'
import imgLogo from '../../../assets/img/GESAPLogo.svg'
import { reenviarCodigoApi, verificarCuentaApi } from '../../../shared/api/auth'
import toast from 'react-hot-toast'

const DURACION_S = 5 * 60

export const VerificarCuentaPage = () => {
  const [step, setStep] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [segundosRestantes, setSegundosRestantes] = useState(DURACION_S)

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  useEffect(() => { if (step === 'codigo') inputRefs.current[0]?.focus() }, [step])

  useEffect(() => {
    if (step !== 'codigo') return
    setSegundosRestantes(DURACION_S)
    const interval = setInterval(() => setSegundosRestantes((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(interval)
  }, [step])

  const enviarCodigo = async (silent = false) => {
    try {
      await reenviarCodigoApi(email)
      if (!silent) toast.success('Código enviado. Revisa tu correo.')
      return true
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al enviar el código')
      return false
    }
  }

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const ok = await enviarCodigo()
    setSending(false)
    if (ok) { setDigits(['', '', '', '', '', '']); setStep('codigo') }
  }

  const handleReenviar = async () => {
    setReenviando(true)
    const ok = await enviarCodigo()
    if (ok) { setDigits(['', '', '', '', '', '']); setSegundosRestantes(DURACION_S); inputRefs.current[0]?.focus() }
    setReenviando(false)
  }

  const handleChange = (i: number, val: string) => {
    const char = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)
    if (char && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    const next = [...digits]
    text.split('').forEach((c, i) => { if (i < 6) next[i] = c })
    setDigits(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  const codigo = digits.join('')

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codigo.length < 6) { toast.error('Ingresa los 6 caracteres del código'); return }
    setLoading(true)
    try {
      await verificarCuentaApi({ codigo, email })
      setSuccess(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Código incorrecto o expirado')
    } finally {
      setLoading(false)
    }
  }

  const mm = String(Math.floor(segundosRestantes / 60)).padStart(2, '0')
  const ss = String(segundosRestantes % 60).padStart(2, '0')

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2647] mb-2">¡Cuenta verificada!</h2>
          <p className="text-slate-500 text-sm mb-6">Ya puedes iniciar sesión con tu cuenta.</p>
          <button onClick={() => navigate('/login')}
            className="block w-full bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:from-[#144272] hover:to-[#00ACC1]">
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src={imgLogo} alt="GESAP" className="h-12 mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Verificar cuenta</h1>
          <p className="text-blue-200 text-sm mt-1">
            {step === 'email' ? 'Ingresa tu correo para recibir un código' : 'Ingresa el código enviado a tu correo'}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 sm:p-8">
          {step === 'email' ? (
            <form onSubmit={handleSolicitar} className="space-y-6">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tu correo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-[#0E6BA8]" size={16} />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="tu@kinal.edu.gt"
                    className="w-full pl-9 border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white" />
                </div>
              </div>
              <button type="submit" disabled={sending}
                className="w-full bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60">
                {sending ? 'Enviando...' : 'Enviar código'}
              </button>
              <p className="text-center text-xs text-slate-400">
                <Link to="/login" className="text-[#0E6BA8] font-semibold hover:underline">Volver a iniciar sesión</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerificar} className="space-y-5">
              <div>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all uppercase font-mono
                        ${d ? 'border-[#0E6BA8] text-[#0A2647] bg-blue-50' : 'border-blue-200 text-slate-400'}
                        focus:border-[#0E6BA8] focus:bg-blue-50`}
                    />
                  ))}
                </div>
                <p className={`text-center text-xs mt-2 ${segundosRestantes === 0 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                  {segundosRestantes === 0 ? 'El código expiró' : `Expira en ${mm}:${ss}`}
                </p>
              </div>

              <button type="submit" disabled={loading || codigo.length < 6 || segundosRestantes === 0}
                className="w-full bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60">
                {loading ? 'Verificando...' : 'Verificar cuenta'}
              </button>

              <p className="text-center text-xs text-slate-400">
                ¿No recibiste el código?{' '}
                <button type="button" onClick={handleReenviar} disabled={reenviando}
                  className="text-[#0E6BA8] font-semibold hover:underline disabled:opacity-60">
                  {reenviando ? 'Enviando...' : 'Reenviar código'}
                </button>
              </p>

              <p className="text-center text-xs text-slate-400">
                <Link to="/login" className="text-[#0E6BA8] font-semibold hover:underline">Volver a iniciar sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
