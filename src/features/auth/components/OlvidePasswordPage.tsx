import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiLock, FiEye, FiEyeOff, FiMail } from 'react-icons/fi'
import imgLogo from '../../../assets/img/GESAPLogo.svg'
import { olvidePasswordApi, restablecerPasswordApi } from '../../../shared/api/auth'
import toast from 'react-hot-toast'

export const OlvidePasswordPage = () => {
  const [params]   = useSearchParams()
  const tokenParam = params.get('token') ?? undefined

  const [step, setStep] = useState<'email' | 'reset'>(tokenParam ? 'reset' : 'email')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { if (step === 'reset') inputRefs.current[0]?.focus() }, [step])

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await olvidePasswordApi(email)
      toast.success('Código enviado. Revisa tu correo.')
      setStep('reset')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al solicitar el código')
    } finally {
      setSending(false)
    }
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codigo.length < 6) { toast.error('Ingresa los 6 caracteres del código'); return }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      await restablecerPasswordApi({ codigo, token: tokenParam, email: email || undefined, password })
      setSuccess(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Código incorrecto o expirado')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2647] mb-2">¡Contraseña actualizada!</h2>
          <p className="text-slate-500 text-sm mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Link to="/login"
            className="block w-full bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:from-[#144272] hover:to-[#00ACC1]">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0E6BA8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src={imgLogo} alt="GESAP" className="h-12 mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Recuperar contraseña</h1>
          <p className="text-blue-200 text-sm mt-1">
            {step === 'email' ? 'Ingresa tu correo para recibir un código' : 'Ingresa el código y tu nueva contraseña'}
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
            <form onSubmit={handleReset} className="space-y-5">
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
                <p className="text-center text-xs text-slate-400 mt-2">Código de 6 caracteres enviado a tu correo</p>
              </div>

              {!tokenParam && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Tu correo</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@kinal.edu.gt"
                    className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white" />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-[#0E6BA8]" size={16} />
                  </div>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    required minLength={6} placeholder="••••••••"
                    className="w-full pl-9 pr-9 border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0E6BA8]">
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Confirmar contraseña</label>
                <input type={showPass ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  required minLength={6} placeholder="••••••••"
                  className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] bg-white" />
              </div>

              <button type="submit" disabled={loading || codigo.length < 6}
                className="w-full bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60">
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
              </button>

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
