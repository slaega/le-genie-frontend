import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'

export const meKeys = {
  all: ['me'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
