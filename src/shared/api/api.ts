import axios from 'axios'

export const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('gesap-kinal-admin-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

const irALogin = () => {
  localStorage.removeItem('gesap-kinal-admin-auth')
  window.location.href = import.meta.env.BASE_URL + 'login'
}

let refrescando: Promise<string | null> | null = null

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config
    // Solo se intenta refrescar (y solo se fuerza logout si eso falla) cuando la petición que dio 401
    // sí llevaba un token — un 401 de login/verificar-email/etc. es un error normal a mostrar en el
    // formulario, no una sesión expirada, y no debe recargar la página.
    const eraAutenticada = !!original?.headers?.Authorization

    if (err.response?.status === 401 && eraAutenticada && !original?._retried && original?.url !== '/auth/refresh') {
      original._retried = true
      try {
        if (!refrescando) {
          refrescando = api.post('/auth/refresh').then((r) => r.data.access_token).finally(() => { refrescando = null })
        }
        const nuevoToken = await refrescando
        if (!nuevoToken) throw new Error('sin token')

        const raw = localStorage.getItem('gesap-kinal-admin-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.state.token = nuevoToken
          localStorage.setItem('gesap-kinal-admin-auth', JSON.stringify(parsed))
        }
        original.headers.Authorization = `Bearer ${nuevoToken}`
        return api(original)
      } catch {
        irALogin()
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  },
)
