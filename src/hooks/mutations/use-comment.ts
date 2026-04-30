import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/lib/api'
import type { CreateCommentPayload, UpdateCommentPayload } from '@/lib/api/types'
import { commentKeys } from '../queries/use-comments'

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentsApi.create(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) })
    },
  })
}

export function useUpdateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentPayload }) =>
      commentsApi.update(postId, commentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) })
    },
  })
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.byPost(postId) })
    },
  })
}
