import { useQuery } from '@tanstack/react-query'
import { contributorsApi } from '@/lib/api'

export const contributorKeys = {
  all: ['contributors'] as const,
  byPost: (postId: string) => [...contributorKeys.all, postId] as const,
}

export function useContributors(postId: string) {
  return useQuery({
    queryKey: contributorKeys.byPost(postId),
    queryFn: () => contributorsApi.list(postId),
    enabled: !!postId,
  })
}
