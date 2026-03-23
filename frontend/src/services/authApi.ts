/**
 * Admin auth against Laravel Sanctum (`/api/auth/*`).
 */
import { buildApiUrl } from './api'
import { clearAuthSession, getAuthToken, setAuthToken, setAuthUser } from './authStore'

export type AuthUserPayload = { id: number; name: string; email: string }

function parseApiError(data: unknown): string {
  if (typeof data !== 'object' || data === null) return 'Login failed.'
  const d = data as Record<string, unknown>
  if (d.success === false && typeof d.message === 'string' && d.message) {
    return d.message
  }
  if (typeof d.message === 'string' && d.message && d.message !== 'The given data was invalid.') {
    return d.message
  }
  const errors = d.errors
  if (typeof errors === 'object' && errors !== null) {
    const firstKey = Object.keys(errors)[0]
    const first = firstKey ? (errors as Record<string, unknown>)[firstKey] : undefined
    if (Array.isArray(first) && first[0]) return String(first[0])
  }
  return 'The provided credentials are incorrect.'
}

/**
 * POST /api/auth/login — expects { success: true, token, user: { id, name, email } }
 */
export async function loginWithPassword(email: string, password: string): Promise<AuthUserPayload> {
  const res = await fetch(buildApiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  const token = data.token as string | undefined
  const user = data.user as AuthUserPayload | undefined
  if (!token || !user?.email) {
    throw new Error('Invalid response from server.')
  }
  setAuthToken(token)
  setAuthUser({ id: user.id, name: user.name, email: user.email })
  return user
}

export async function logoutApi(): Promise<void> {
  const token = getAuthToken()
  if (!token) {
    clearAuthSession()
    return
  }
  try {
    await fetch(buildApiUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
  } catch {
    /* network errors — still clear local session */
  } finally {
    clearAuthSession()
  }
}

export async function fetchCurrentUser(): Promise<AuthUserPayload | null> {
  const token = getAuthToken()
  if (!token) return null
  try {
    const res = await fetch(buildApiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean
      user?: AuthUserPayload
    }
    if (data.success === false) return null
    const u = data.user ?? null
    if (u?.email) {
      setAuthUser({ id: u.id, name: u.name, email: u.email })
    }
    return u ?? null
  } catch {
    return null
  }
}
