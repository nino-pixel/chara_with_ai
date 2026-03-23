/**
 * Admin auth persistence for Laravel Sanctum (Bearer token + minimal user snapshot).
 */
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

/** One-time migration from older keys */
const LEGACY_TOKEN_KEY = 'chara_admin_sanctum_token'
const LEGACY_USER_KEY = 'chara_admin_user'

export type AuthUserMinimal = {
  id: number
  name: string
  email: string
}

function migrateLegacyKeys(): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (!localStorage.getItem(AUTH_TOKEN_KEY) && localStorage.getItem(LEGACY_TOKEN_KEY)) {
      localStorage.setItem(AUTH_TOKEN_KEY, localStorage.getItem(LEGACY_TOKEN_KEY)!)
      localStorage.removeItem(LEGACY_TOKEN_KEY)
    }
    if (!localStorage.getItem(AUTH_USER_KEY) && localStorage.getItem(LEGACY_USER_KEY)) {
      localStorage.setItem(AUTH_USER_KEY, localStorage.getItem(LEGACY_USER_KEY)!)
      localStorage.removeItem(LEGACY_USER_KEY)
    }
  } catch {
    /* ignore */
  }
}

migrateLegacyKeys()

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getAuthUser(): AuthUserMinimal | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Record<string, unknown>
    if (typeof p !== 'object' || p === null || typeof p.email !== 'string') return null
    const id = typeof p.id === 'number' ? p.id : Number(p.id)
    return {
      id: Number.isFinite(id) ? id : 0,
      name: String(p.name ?? ''),
      email: p.email,
    }
  } catch {
    return null
  }
}

export function setAuthUser(user: AuthUserMinimal | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_KEY)
      return
    }
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({ id: user.id, name: user.name, email: user.email })
    )
  } catch {
    /* ignore */
  }
}

/** Clear token + user (and legacy keys if any remain). */
export function clearAuthSession(): void {
  clearAuthToken()
  setAuthUser(null)
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
  } catch {
    /* ignore */
  }
}

/** Authorization header for JSON API calls when a session exists. */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

/**
 * Fired when the API client gets 401 (e.g. expired token).
 * - `AuthSessionListener` uses React Router to go to `/admin/login` (no full page reload).
 * - `AdminAuthProvider` clears in-memory user state.
 */
export const AUTH_SESSION_EXPIRED_EVENT = 'chara:auth-session-expired'

export function dispatchAuthSessionExpired(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT))
}
