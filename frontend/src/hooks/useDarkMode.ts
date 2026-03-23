import { useEffect, useState } from 'react'

/**
 * useDarkMode — reads/writes a `data-theme="dark"` attribute on <html>
 * and persists the preference in localStorage.
 */
export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    // Check localStorage first; fall back to system preference
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
