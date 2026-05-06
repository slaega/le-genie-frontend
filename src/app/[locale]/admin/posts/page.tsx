import { serverApi } from '@/lib/api/server'
import type { AdminPost, PaginatedResponse } from '@/lib/api/types'
import { AdminPostsTable } from '@/components/organisms/admin-posts-table'

export const metadata = { title: 'Publications — Admin — Le Génie' }

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const { page = '1', status, search } = await searchParams
  const qs = new URLSearchParams({ page, limit: '20' })
  if (status) qs.set('status', status)
  if (search) qs.set('search', search)

  let data: PaginatedResponse<AdminPost> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    hasNextPage: false,
  }

  try {
    data = await serverApi.get<PaginatedResponse<AdminPost>>(`admin/posts?${qs}`)
  } catch {
    // affiche vide
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publications</h1>
        <p className="text-gray-400 text-sm mt-1">
          {data.total.toLocaleString('fr-FR')} article{data.total !== 1 ? 's' : ''} au total
        </p>
      </div>
      <AdminPostsTable
        initialData={data}
        currentPage={Number(page)}
        initialStatus={status ?? ''}
        initialSearch={search ?? ''}
      />
    </div>
  )
}
