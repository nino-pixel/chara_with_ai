import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top when the route path changes (public + admin shells).
 * Uses instant scroll when the user prefers reduced motion.
 */
export function useScrollTopOnRouteChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [pathname])
}
