import { useQuery } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import { postKeys } from './use-posts'

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.get(id),
    enabled: !!id,
  })
}
