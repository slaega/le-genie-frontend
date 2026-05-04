'use client'

import { useQuery } from '@tanstack/react-query'
import { viewsApi, type ViewCount } from '@/lib/api'

export const viewKeys = {
  all: ['views'] as const,
  count: (postId: string) => [...viewKeys.all, 'count', postId] as const,
}

export function useViewCount(postId: string) {
  return useQuery<ViewCount>({
    queryKey: viewKeys.count(postId),
    queryFn: () => viewsApi.count(postId),
    enabled: !!postId,
    staleTime: 60_000,
  })
}
