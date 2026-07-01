import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiCamera, FiLogOut, FiLoader } from 'react-icons/fi'
import { useAuthStore } from '../../features/auth/store/authStore'
import { cambiarFotoPerfilApi } from '../api/auth'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = { AUDITOR: 'Auditor', COORDINADOR: 'Coordinador' }

export const UserMenu = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!user) return null

  const displayName = `${user.primerNombre} ${user.primerApellido}`.trim()
  const initials = displayName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const { data } = await cambiarFotoPerfilApi(formData)
      useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, fotoPerfil: data.fotoPerfil } : s.user }))
      toast.success('Foto de perfil actualizada')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al subir la foto')
    } finally {
      setSubiendo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 group">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-[#0A2647] leading-tight">{displayName}</p>
          <p className="text-xs text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden shrink-0 group-hover:ring-2 ring-[#00ACC1] ring-offset-2 transition-all">
          {user.fotoPerfil ? (
            <img src={`/${user.fotoPerfil}`} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initials || <FiUser size={15} />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl border border-blue-100 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-blue-50 sm:hidden">
            <p className="text-sm font-bold text-[#0A2647]">{displayName}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendo}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {subiendo ? <FiLoader size={15} className="animate-spin" /> : <FiCamera size={15} />}
            {subiendo ? 'Subiendo...' : 'Cambiar foto de perfil'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-blue-50"
          >
            <FiLogOut size={15} /> Cerrar sesión
          </button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
