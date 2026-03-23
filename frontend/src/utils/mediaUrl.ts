/**
 * Normalize Laravel storage URLs for the SPA origin.
 * Full URLs like http://localhost/storage/... hit :80 (wrong); relative /storage/... uses Vite proxy → Laravel :8000.
 */
export function resolveStorageUrl(src: string | undefined | null): string {
  if (src == null || typeof src !== 'string') return ''
  const s = src.trim()
  if (!s) return ''
  if (s.startsWith('/storage/') || s.startsWith('/storage?')) return s
  if (s.startsWith('data:') || s.startsWith('blob:')) return s
  // Any host — keep path only so current origin + Vite /storage proxy works in dev
  const m = s.match(/^https?:\/\/[^/]+(\/storage\/.+)$/i)
  if (m) return m[1]
  return s
}
