import { ApiError } from './types'

const API_PREFIX = '/api'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData
  const headers: HeadersInit = isFormData
    ? { ...(init?.headers ?? {}) }
    : { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }

  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.message ?? res.statusText, data)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get<T>(path: string, init?: RequestInit) {
    return apiFetch<T>(path, { method: 'GET', ...init })
  },
  post<T>(path: string, body?: unknown, init?: RequestInit) {
    const isForm = body instanceof FormData
    return apiFetch<T>(path, {
      method: 'POST',
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    })
  },
  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    const isForm = body instanceof FormData
    return apiFetch<T>(path, {
      method: 'PATCH',
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    })
  },
  delete<T>(path: string, init?: RequestInit) {
    return apiFetch<T>(path, { method: 'DELETE', ...init })
  },
}
