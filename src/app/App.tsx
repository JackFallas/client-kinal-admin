import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './router/AppRoutes'

export const App = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontSize: '14px' } }} />
    <AppRoutes />
  </BrowserRouter>
)
