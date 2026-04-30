import { useQuery } from '@tanstack/react-query'
import { commentsApi } from '@/lib/api'

export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: string) => [...commentKeys.all, postId] as const,
  byPostPage: (postId: string, page: number) =>
    [...commentKeys.byPost(postId), page] as const,
}

export function useComments(postId: string, page = 1) {
  return useQuery({
    queryKey: commentKeys.byPostPage(postId, page),
    queryFn: () => commentsApi.list(postId, page),
    enabled: !!postId,
  })
}
