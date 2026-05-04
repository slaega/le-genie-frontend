'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likesApi, type LikeStats, type ToggleLikeResult } from '@/lib/api'
import { getVisitorId } from '@/lib/visitor-id'
import { likeKeys } from '@/hooks/queries/use-like-stats'

export function useToggleLike(postId: string) {
  const qc = useQueryClient()

  return useMutation<
    ToggleLikeResult,
    Error,
    void,
    { previous?: LikeStats }
  >({
    mutationFn: () => likesApi.toggle(postId, getVisitorId()),

    /* Optimistic update — flip immediately, server confirms after */
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: likeKeys.stats(postId) })
      const previous = qc.getQueryData<LikeStats>(likeKeys.stats(postId))
      if (previous) {
        qc.setQueryData<LikeStats>(likeKeys.stats(postId), {
          liked: !previous.liked,
          count: previous.count + (previous.liked ? -1 : 1),
        })
      }
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(likeKeys.stats(postId), ctx.previous)
      }
    },

    onSuccess: (data) => {
      qc.setQueryData<LikeStats>(likeKeys.stats(postId), data)
    },
  })
}
