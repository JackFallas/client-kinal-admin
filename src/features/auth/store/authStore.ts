import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginApi, logoutApi, type AuthUser, type AdminRole } from '../../../shared/api/auth'

const ALLOWED: AdminRole[] = ['AUDITOR', 'COORDINADOR']

interface PerfilRecordado {
  email: string
  nombre: string
  fotoPerfil: string | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  perfilRecordado: PerfilRecordado | null
  login: (email: string, password: string, recordar?: boolean) => Promise<void>
  logout: () => Promise<void>
  cerrarPorInactividad: () => void
  olvidarPerfil: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      perfilRecordado: null,

      login: async (email, password, recordar) => {
        set({ loading: true, error: null })
        try {
          const { data } = await loginApi(email, password, recordar)
          if (!ALLOWED.includes(data.usuario.role)) {
            set({ loading: false, error: 'Acceso denegado. Este portal es solo para personal administrativo.' })
            return
          }
          set({
            user: data.usuario,
            token: data.access_token,
            isAuthenticated: true,
            loading: false,
            perfilRecordado: recordar
              ? { email, nombre: `${data.usuario.primerNombre} ${data.usuario.primerApellido}`, fotoPerfil: data.usuario.fotoPerfil ?? null }
              : null,
          })
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message ?? 'Correo o contraseña incorrectos' })
        }
      },

      logout: async () => {
        try { await logoutApi() } catch { /* sesión ya expirada */ }
        set({ user: null, token: null, isAuthenticated: false, error: null, perfilRecordado: null })
      },

      // Solo bloquea la pantalla actual (sin llamar a logout ni tocar la cookie de sesión recordada) — el timeout de inactividad exige contraseña de nuevo, no cierra la sesión de fondo.
      cerrarPorInactividad: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      olvidarPerfil: () => set({ perfilRecordado: null }),
    }),
    {
      name: 'gesap-kinal-admin-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated, perfilRecordado: s.perfilRecordado }),
    }
  )
)
