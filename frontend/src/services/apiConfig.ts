/**
 * Laravel API base URL (no trailing slash).
 * - Leave empty to use same-origin `/api/*` (e.g. Vite proxy to php artisan serve).
 * - Or set e.g. `http://127.0.0.1:8000` to call Laravel directly.
 */
export function getApiBaseUrl(): string {
  const raw =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env as Record<string, string | undefined>).VITE_API_BASE_URL
  return (raw || '').replace(/\/$/, '')
}
