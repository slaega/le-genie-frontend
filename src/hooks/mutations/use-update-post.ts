import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import type { Post, UpdatePostPayload } from '@/lib/api/types'
import { postKeys } from '../queries/use-posts'

interface UpdatePostVars {
  id: string
  payload: UpdatePostPayload
  cover?: File
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload, cover }: UpdatePostVars) =>
      cover
        ? postsApi.updateWithCover(id, payload, cover)
        : postsApi.update(id, payload),
    onSuccess: (post: Post) => {
      qc.setQueryData(postKeys.detail(post.id), post)
      qc.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
