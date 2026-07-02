import { useEffect, useRef } from 'react'
import { useAuthStore } from '../../features/auth/store/authStore'

const LIMITE_MS = 10 * 60 * 1000
const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

/** Tras 10 min sin interacción, bloquea la pantalla (exige contraseña de nuevo) sin cerrar la sesión de fondo. */
export const useInactivityLogout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const cerrarPorInactividad = useAuthStore((s) => s.cerrarPorInactividad)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const reiniciar = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => cerrarPorInactividad(), LIMITE_MS)
    }

    reiniciar()
    EVENTOS.forEach((ev) => window.addEventListener(ev, reiniciar, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTOS.forEach((ev) => window.removeEventListener(ev, reiniciar))
    }
  }, [isAuthenticated, cerrarPorInactividad])
}
