import { api } from '../client'
import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  PaginatedResponse,
} from '../types'

export const commentsApi = {
  list(postId: string, page = 1, limit = 20) {
    return api.get<PaginatedResponse<Comment>>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`,
    )
  },

  create(postId: string, payload: CreateCommentPayload) {
    return api.post<Comment>(`/posts/${postId}/comments`, payload)
  },

  update(postId: string, commentId: string, payload: UpdateCommentPayload) {
    return api.patch<Comment>(`/posts/${postId}/comments/${commentId}`, payload)
  },

  delete(postId: string, commentId: string) {
    return api.delete<void>(`/posts/${postId}/comments/${commentId}`)
  },
}
