/**
 * Hybrid API + localStorage integration layer (CHara Realty).
 *
 * - `api.ts` — JSON fetch to Laravel `/api/*` (same-origin via Vite proxy, or `VITE_API_BASE_URL`).
 * - `apiBootstrap.ts` — on app load: health check → optional one-time `POST /sync/from-local` → hydrate stores from GET endpoints.
 * - `createPublicInquiry` in `inquiriesService.ts` — tries `POST /api/inquiries` first, then falls back to in-memory/localStorage stores.
 *
 * localStorage simulation (`chara_realty_simulation_v1`) is never removed; offline behavior is preserved.
 */

export { apiGet, apiPost, apiPut, apiPatch, apiDelete, buildApiUrl } from './api'
export {
  getAuthToken,
  setAuthToken,
  clearAuthSession,
  getAuthUser,
  setAuthUser,
  getAuthHeaders,
  dispatchAuthSessionExpired,
  AUTH_SESSION_EXPIRED_EVENT,
} from './authStore'
export { getApiBaseUrl } from './apiConfig'
export { runApiBootstrap, MIGRATION_TO_API_KEY } from './apiBootstrap'
