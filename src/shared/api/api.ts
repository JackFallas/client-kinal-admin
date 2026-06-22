import axios from 'axios'

export const api = axios.create({ baseURL: '/kinal-api' })

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('gesap-kinal-admin-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gesap-kinal-admin-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)
