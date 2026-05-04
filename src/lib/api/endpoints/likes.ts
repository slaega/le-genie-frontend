import { api } from '../client'

export interface LikeStats {
  count: number
  liked: boolean
}

export interface ToggleLikeResult {
  liked: boolean
  count: number
}

const base = (postId: string) => `/posts/${postId}/likes`

export const likesApi = {
  /** Returns count + whether the current visitor (by fingerprint) has liked. */
  stats(postId: string, fingerprint?: string) {
    const qs = fingerprint
      ? `?fingerprint=${encodeURIComponent(fingerprint)}`
      : ''
    return api.get<LikeStats>(`${base(postId)}${qs}`)
  },

  /** Toggles the like for (postId, fingerprint). Returns new state. */
  toggle(postId: string, fingerprint?: string) {
    return api.post<ToggleLikeResult>(base(postId), { fingerprint })
  },
}
