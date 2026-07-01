import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../../features/auth/store/authStore'

interface AlertaPayload {
  destino: 'COORDINADOR_SECCION' | 'ENFERMERO'
  seccionNivel?: string | null
  seccionGrado?: number | null
  mensaje: string
  origenNombre: string
}

export const useAlertNotifications = () => {
  const { token, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !token || !user) return
    if (user.role !== 'COORDINADOR') return // solo coordinador recibe alertas de sección en este portal

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const socket = io(window.location.origin + '/sesiones', {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      path: '/admin-ws',
    })

    socket.on('alerta:nueva', (payload: AlertaPayload) => {
      const esRelevante =
        payload.destino === 'COORDINADOR_SECCION' &&
        payload.seccionNivel === user.areaNivel &&
        payload.seccionGrado === user.areaGrado

      if (!esRelevante) return
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Nueva alerta de sección', { body: `${payload.origenNombre}: ${payload.mensaje}` })
      }
    })

    return () => { socket.disconnect() }
  }, [isAuthenticated, token, user])
}
