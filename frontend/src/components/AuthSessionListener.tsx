import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_SESSION_EXPIRED_EVENT } from '../services/authStore'

/**
 * Listens for session expiry from `api.ts` (401) and navigates with React Router
 * — avoids `window.location.assign` full reload so public SPA state can stay warm.
 */
export default function AuthSessionListener() {
  const navigate = useNavigate()

  useEffect(() => {
    const onExpired = () => {
      if (typeof window === 'undefined') return
      const path = window.location.pathname
      if (path === '/admin/login') return
      if (path.startsWith('/admin')) {
        navigate('/admin/login', { replace: true })
      }
    }
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
  }, [navigate])

  return null
}
