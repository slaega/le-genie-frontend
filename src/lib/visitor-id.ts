/**
 * Persists a stable visitor id (UUID v4) in localStorage so anonymous likes/views
 * stay tied to the same user across sessions. Falls back to a per-tab id in
 * environments without localStorage (e.g. server, private mode).
 */

const STORAGE_KEY = 'lg.visitorId'

let inMemoryId: string | null = null

function generate(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // RFC4122-ish fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    // SSR — never used for sending; just a placeholder.
    return ''
  }
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY)
    if (cached) return cached
    const fresh = generate()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    // localStorage blocked (private browsing, SSR, etc.)
    if (!inMemoryId) inMemoryId = generate()
    return inMemoryId
  }
}
