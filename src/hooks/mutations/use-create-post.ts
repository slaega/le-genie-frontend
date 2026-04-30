import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import { postKeys } from '../queries/use-posts'

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => postsApi.create(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
