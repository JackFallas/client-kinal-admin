import { useRef, useState } from 'react'
import { FiX, FiCamera, FiMail, FiShield, FiBook, FiLoader } from 'react-icons/fi'
import { useAuthStore } from '../../features/auth/store/authStore'
import { cambiarFotoPerfilApi } from '../api/auth'
import toast from 'react-hot-toast'

const ROLE_LABEL: Record<string, string> = { AUDITOR: 'Auditor', COORDINADOR: 'Coordinador' }
const NIVEL_LABEL: Record<string, string> = { BASICOS: 'Básicos', DIVERSIFICADOS: 'Diversificados' }

export const PerfilModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuthStore()
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const displayName = `${user.primerNombre}${user.segundoNombre ? ' ' + user.segundoNombre : ''} ${user.primerApellido}${user.segundoApellido ? ' ' + user.segundoApellido : ''}`.trim()
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-lg font-bold text-[#0A2647]">Mi Perfil</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FiX size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0E6BA8] to-[#00ACC1] flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden group disabled:opacity-70"
              title="Cambiar foto"
            >
              {user.fotoPerfil ? (
                <img src={`/${user.fotoPerfil}`} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {subiendo ? <FiLoader size={18} className="animate-spin text-white" /> : <FiCamera size={18} className="text-white" />}
              </div>
            </button>
            <p className="text-xs text-slate-400 mt-2">Click en la foto para cambiarla</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="space-y-3">
            <div className="text-center mb-2">
              <p className="text-lg font-bold text-[#0A2647]">{displayName}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{ROLE_LABEL[user.role] ?? user.role}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <FiMail size={16} className="text-[#0E6BA8] shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Correo</p>
                <p className="text-sm font-medium text-[#0A2647]">{user.email}</p>
              </div>
            </div>

            {user.role === 'COORDINADOR' && user.areaNivel && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <FiBook size={16} className="text-[#0E6BA8] shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Área a cargo</p>
                  <p className="text-sm font-medium text-[#0A2647]">
                    {NIVEL_LABEL[user.areaNivel] ?? user.areaNivel}{user.areaGrado ? ` — ${user.areaGrado}° grado` : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <FiShield size={16} className="text-[#0E6BA8] shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Rol</p>
                <p className="text-sm font-medium text-[#0A2647]">{ROLE_LABEL[user.role] ?? user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
