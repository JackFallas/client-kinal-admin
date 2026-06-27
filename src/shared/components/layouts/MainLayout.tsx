import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  FiHome, FiUsers, FiBook, FiActivity, FiBell,
  FiFolder, FiShield, FiLogOut, FiUser, FiX,
  FiMenu, FiList,
} from 'react-icons/fi'
import imgLogo from '../../../assets/img/GESAPLogo.svg'
import { useAuthStore } from '../../../features/auth/store/authStore'
import toast from 'react-hot-toast'

const navCoordinador = [
  { to: '/portal',             icon: FiHome,     label: 'Dashboard',        end: true  },
  { to: '/portal/usuarios',    icon: FiUsers,    label: 'Usuarios',         end: false },
  { to: '/portal/secciones',   icon: FiBook,     label: 'Secciones',        end: false },
  { to: '/portal/visitas',     icon: FiActivity, label: 'Visitas',          end: true  },
  { to: '/portal/alertas',     icon: FiBell,     label: 'Alertas',          end: false },
  { to: '/portal/documentos',  icon: FiFolder,   label: 'Documentos',       end: false },
  { to: '/portal/sesiones',    icon: FiShield,   label: 'Sesiones activas', end: false },
  { to: '/portal/audit-logs',  icon: FiList,     label: 'Logs auditoría',   end: false },
]

const ROLE_LABELS: Record<string, string> = {
  AUDITOR:     'Auditor',
  COORDINADOR: 'Coordinador',
}

interface SidebarProps { isOpen?: boolean; onClose?: () => void }

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const role     = user?.role ?? ''
  const navItems = navCoordinador

  const displayName = user ? `${user.primerNombre} ${user.primerApellido}`.trim() : 'Usuario'
  const initials    = displayName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64
      lg:static lg:z-auto lg:translate-x-0
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      bg-gradient-to-b from-[#0A2647] to-[#0D3B6E] flex flex-col shadow-2xl shrink-0
    `}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="bg-white/10 border border-white/15 p-2.5 rounded-xl flex-shrink-0">
          <img src={imgLogo} alt="GESAP" className="h-7 w-7 object-contain object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">GESAP Kinal</h1>
          <p className="text-blue-300 text-xs font-medium">Portal Administrativo</p>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg transition-colors">
          <FiX size={20} />
        </button>
      </div>

      {/* Sección */}
      <div className="px-5 pt-6 pb-2">
        <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-widest">Módulos</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 pb-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium group ${
                isActive
                  ? 'bg-gradient-to-r from-[#00ACC1] to-[#26A69A] text-white shadow-lg shadow-cyan-900/40'
                  : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}>
                  <Icon size={17} />
                </span>
                <span className="truncate">{label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ACC1] to-[#26A69A] flex items-center justify-center shrink-0 shadow-md text-white text-sm font-bold">
            {initials || <FiUser size={15} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-blue-300 text-xs truncate">{ROLE_LABELS[role] ?? role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
            title="Cerrar sesión"
          >
            <FiLogOut size={16} />
          </button>
        </div>
        <p className="text-blue-400/40 text-[10px] text-center mt-3">© Jack Fallas</p>
      </div>
    </aside>
  )
}

const Navbar = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { user } = useAuthStore()

  const displayName = user ? `${user.primerNombre} ${user.primerApellido}`.trim() : 'Usuario'
  const initials    = displayName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 text-slate-500 hover:text-[#0A2647] rounded-xl hover:bg-blue-50 transition-colors"
          aria-label="Abrir menú"
        >
          <FiMenu size={22} />
        </button>
        <div>
          <p className="text-[#0A2647] font-bold text-sm">Portal Administrativo</p>
          <p className="text-slate-400 text-xs">Enfermería Escolar — GESAP Kinal</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-[#0E6BA8] transition-colors rounded-xl hover:bg-blue-50">
          <FiBell size={19} />
        </button>
        <div className="w-px h-8 bg-blue-100" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#0A2647] leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-sm font-bold shadow-md">
            {initials || <FiUser size={15} />}
          </div>
        </div>
      </div>
    </header>
  )
}

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#EBF5FB]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
