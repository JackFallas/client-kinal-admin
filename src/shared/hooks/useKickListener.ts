import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../../features/auth/store/authStore'

export const useKickListener = () => {
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    const socket = io(window.location.origin + '/sesiones', {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      path: '/admin-ws',
    })

    socket.on('session:kicked', () => {
      socket.disconnect()
      // La sesión ya quedó invalidada en el servidor por el kick — llamar a
      // logoutApi() aquí daría 401 y el interceptor de la API pisaría este
      // redirect. Se limpia el estado local directamente, sin ir a la red.
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false, error: null })
      window.location.replace(`${base}/login?kicked=true`)
    })

    return () => { socket.disconnect() }
  }, [isAuthenticated, token])
}
