/**
 * JSON API client for Laravel backend (`/api/*`).
 * Works with `VITE_API_BASE_URL` empty + Vite proxy, or a full backend URL.
 */
import { clearAuthSession, dispatchAuthSessionExpired, getAuthHeaders, getAuthToken } from './authStore'
import { getApiBaseUrl } from './apiConfig'

/** Public API path builder (e.g. `/auth/login` → `/api/auth/login` or full URL). */
export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) {
    return `/api${p}`
  }
  return `${base}/api${p}`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(path)

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (res.status === 401) {
    clearAuthSession()
    dispatchAuthSessionExpired()
    throw new Error('Unauthenticated.')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }
    const obj = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
    let apiMessage =
      obj && obj.success === false && typeof obj.message === 'string' ? obj.message : null
    if (!apiMessage && obj?.errors && typeof obj.errors === 'object' && obj.errors !== null) {
      const errs = obj.errors as Record<string, string[]>
      const first = Object.values(errs).flat().find((m) => typeof m === 'string' && m.length > 0)
      if (first) apiMessage = first
    }
    throw new Error(apiMessage || `Request failed (${res.status})`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return (await res.text()) as T
  }

  return (await res.json()) as T
}

export function apiGet<T>(path: string, init?: RequestInit) {
  return request<T>(path, { method: 'GET', ...(init || {}) })
}

export function apiPost<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(init || {}),
  })
}

/**
 * Multipart POST (FormData). Do not set Content-Type — browser sets boundary.
 * Uses XMLHttpRequest so upload progress can be reported.
 */
export function apiPostFormData<T>(
  path: string,
  formData: FormData,
  options?: { onUploadProgress?: (loaded: number, total: number) => void }
): Promise<T> {
  const url = buildApiUrl(path)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true
    xhr.setRequestHeader('Accept', 'application/json')
    const token = getAuthToken()
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        options?.onUploadProgress?.(e.loaded, e.total)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        clearAuthSession()
        dispatchAuthSessionExpired()
        reject(new Error('Unauthenticated.'))
        return
      }

      const text = xhr.responseText || ''
      let parsed: unknown
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        parsed = null
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const obj = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
        let apiMessage =
          obj && obj.success === false && typeof obj.message === 'string' ? obj.message : null
        if (!apiMessage && obj?.errors && typeof obj.errors === 'object' && obj.errors !== null) {
          const errs = obj.errors as Record<string, string[]>
          const first = Object.values(errs).flat().find((m) => typeof m === 'string' && m.length > 0)
          if (first) apiMessage = first
        }
        reject(new Error(apiMessage || `Request failed (${xhr.status})`))
        return
      }

      resolve(parsed as T)
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

export function apiPut<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(init || {}),
  })
}

export function apiPatch<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(init || {}),
  })
}

export function apiDelete<T>(path: string, init?: RequestInit) {
  return request<T>(path, { method: 'DELETE', ...(init || {}) })
}
