import { api } from '../client'
import type { Contributor } from '../types'

export const contributorsApi = {
  list(postId: string) {
    return api.get<Contributor[]>(`/posts/${postId}/contributors`)
  },

  remove(postId: string, contributorId: string) {
    return api.delete<void>(`/posts/${postId}/contributors/${contributorId}`)
  },

  leave(postId: string) {
    return api.post<void>(`/posts/${postId}/contributors/leave`)
  },
}
