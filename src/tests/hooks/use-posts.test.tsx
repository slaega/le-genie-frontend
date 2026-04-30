import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { postKeys, usePosts } from '@/hooks/queries/use-posts'
import type { PaginatedResponse, Post } from '@/lib/api/types'

vi.mock('@/lib/api', () => ({
  postsApi: {
    list: vi.fn(),
  },
}))

import { postsApi } from '@/lib/api'

const mockPost: Post = {
  id: 'post-1',
  title: 'Test Post',
  content: null,
  imagePath: null,
  status: 'PUBLISHED',
  contributors: [],
  postTags: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockPage: PaginatedResponse<Post> = {
  items: [mockPost],
  total: 1,
  page: 1,
  limit: 10,
  hasNextPage: false,
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.mocked(postsApi.list).mockReset()
})

describe('postKeys', () => {
  it('produces stable list key from params', () => {
    const key1 = postKeys.list({ page: 1, limit: 10 })
    const key2 = postKeys.list({ page: 1, limit: 10 })
    expect(JSON.stringify(key1)).toBe(JSON.stringify(key2))
  })

  it('differentiates list and detail keys', () => {
    expect(postKeys.lists()).not.toEqual(postKeys.details())
  })
})

describe('usePosts', () => {
  it('fetches posts and returns data', async () => {
    vi.mocked(postsApi.list).mockResolvedValue(mockPage)

    const { result } = renderHook(() => usePosts(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0].id).toBe('post-1')
  })

  it('is in loading state before data arrives', async () => {
    vi.mocked(postsApi.list).mockResolvedValue(mockPage)

    const { result } = renderHook(() => usePosts(), { wrapper })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(postsApi.list).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePosts(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Network error')
  })

  it('passes query params to postsApi.list', async () => {
    vi.mocked(postsApi.list).mockResolvedValue(mockPage)

    const { result } = renderHook(() => usePosts({ page: 2, limit: 5 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(postsApi.list).toHaveBeenCalledWith({ page: 2, limit: 5 })
  })
})
