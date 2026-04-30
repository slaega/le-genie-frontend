import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import { postKeys } from '../queries/use-posts'

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: postKeys.detail(id) })
      qc.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
