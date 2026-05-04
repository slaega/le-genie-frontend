import { api } from '../client'

export interface ViewCount {
  count: number
}

export interface TrackViewResult {
  count: number
  isNew: boolean
}

const base = (postId: string) => `/posts/${postId}/views`

export const viewsApi = {
  /** Returns total distinct readers for a post. */
  count(postId: string) {
    return api.get<ViewCount>(base(postId))
  },

  /** Idempotent — records a view for (postId, readerId). */
  track(postId: string, readerId?: string) {
    return api.post<TrackViewResult>(base(postId), { readerId })
  },
}
