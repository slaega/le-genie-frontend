import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiError } from '@/lib/api/types'

// We test the API client by intercepting the global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Dynamic import ensures the module picks up the stubbed fetch
const { api } = await import('@/lib/api/client')

function makeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('api client', () => {
  describe('api.get', () => {
    it('prepends /api prefix and uses GET', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, { id: '1' }))
      await api.get('/posts')
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({ method: 'GET', credentials: 'include' }),
      )
    })

    it('returns parsed JSON on success', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, { id: '1', title: 'Hello' }))
      const result = await api.get('/posts/1')
      expect(result).toEqual({ id: '1', title: 'Hello' })
    })

    it('returns undefined for 204 No Content', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject() } as unknown as Response)
      const result = await api.delete('/posts/1')
      expect(result).toBeUndefined()
    })
  })

  describe('api.post', () => {
    it('sends JSON body with Content-Type header', async () => {
      mockFetch.mockResolvedValue(makeResponse(201, { id: 'new' }))
      await api.post('/posts', { title: 'New Post' })
      const [, init] = mockFetch.mock.calls[0]
      expect(init.method).toBe('POST')
      expect(init.headers['Content-Type']).toBe('application/json')
      expect(JSON.parse(init.body)).toEqual({ title: 'New Post' })
    })

    it('sends FormData without Content-Type header', async () => {
      mockFetch.mockResolvedValue(makeResponse(200, {}))
      const fd = new FormData()
      fd.append('file', new Blob(['test']), 'cover.jpg')
      await api.post('/posts/1/image', fd)
      const [, init] = mockFetch.mock.calls[0]
      expect(init.body).toBeInstanceOf(FormData)
      expect(init.headers['Content-Type']).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('throws ApiError with status and message on non-ok response', async () => {
      mockFetch.mockResolvedValue(makeResponse(404, { message: 'Not found' }))
      await expect(api.get('/posts/missing')).rejects.toSatisfy(
        (err: unknown) =>
          err instanceof ApiError && err.status === 404 && err.message === 'Not found',
      )
    })

    it('falls back to statusText when response body has no message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
      } as unknown as Response)
      await expect(api.get('/posts')).rejects.toSatisfy(
        (err: unknown) =>
          err instanceof ApiError && err.status === 500 && err.message === 'Internal Server Error',
      )
    })
  })
})
