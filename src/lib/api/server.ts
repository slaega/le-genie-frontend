import 'server-only'
import { cookies } from 'next/headers'
import { ApiError, type AuthTokens } from './types'

const BASE = process.env.API_BASE_URL ?? ''

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const jar = await cookies()
  const accessToken = jar.get('access_token')?.value

  const isFormData = init?.body instanceof FormData
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init?.headers ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.message ?? res.statusText, data)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const serverApi = {
  get<T>(path: string) {
    return serverFetch<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body?: unknown) {
    const isForm = body instanceof FormData
    return serverFetch<T>(path, {
      method: 'POST',
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  patch<T>(path: string, body?: unknown) {
    const isForm = body instanceof FormData
    return serverFetch<T>(path, {
      method: 'PATCH',
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string) {
    return serverFetch<T>(path, { method: 'DELETE' })
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const res = await fetch(`${BASE}auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })
    if (!res.ok) throw new ApiError(res.status, 'Refresh failed')
    return res.json()
  },
}
