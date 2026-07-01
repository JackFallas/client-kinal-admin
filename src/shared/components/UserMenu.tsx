import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiUserCheck, FiLogOut } from 'react-icons/fi'
import { useAuthStore } from '../../features/auth/store/authStore'
import { PerfilModal } from './PerfilModal'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = { AUDITOR: 'Auditor', COORDINADOR: 'Coordinador' }

export const UserMenu = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showPerfil, setShowPerfil] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
            onClick={() => { setShowPerfil(true); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 transition-colors"
          >
            <FiUserCheck size={15} /> Ver mi perfil
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-blue-50"
          >
            <FiLogOut size={15} /> Cerrar sesión
          </button>
        </div>
      )}

      {showPerfil && <PerfilModal onClose={() => setShowPerfil(false)} />}
    </div>
  )
}
