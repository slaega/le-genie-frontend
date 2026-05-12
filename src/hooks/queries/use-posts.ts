import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import type { PostsQueryParams } from '@/lib/api/types';

export const postKeys = {
    all: ['posts'] as const,
    lists: () => [...postKeys.all, 'list'] as const,
    list: (params: PostsQueryParams) => [...postKeys.lists(), params] as const,
    details: () => [...postKeys.all, 'detail'] as const,
    detail: (id: string) => [...postKeys.details(), id] as const,
};

export function usePosts(params?: PostsQueryParams) {
    return useQuery({
        queryKey: postKeys.list(params ?? {}),
        queryFn: () => postsApi.list(params),
    });
}

export function useInfinitePosts(params?: Omit<PostsQueryParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: [...postKeys.lists(), 'infinite', params],
        queryFn: ({ pageParam }) =>
            postsApi.list({ ...params, page: pageParam as number, limit: 12 }),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.hasNextPage ? last.page + 1 : undefined,
    });
}
