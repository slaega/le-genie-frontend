import { serverApi } from '@/lib/api/server'
import type { AdminUser, PaginatedResponse } from '@/lib/api/types'
import { AdminUsersTable } from '@/components/organisms/admin-users-table'

export const metadata = { title: 'Utilisateurs — Admin — Le Génie' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page = '1', search } = await searchParams
  const qs = new URLSearchParams({ page, limit: '20' })
  if (search) qs.set('search', search)

  let data: PaginatedResponse<AdminUser> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    hasNextPage: false,
  }

  try {
    data = await serverApi.get<PaginatedResponse<AdminUser>>(`admin/users?${qs}`)
  } catch {
    // affiche vide
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-gray-400 text-sm mt-1">
          {data.total.toLocaleString('fr-FR')} utilisateur{data.total !== 1 ? 's' : ''} inscrits
        </p>
      </div>
      <AdminUsersTable
        initialData={data}
        currentPage={Number(page)}
        initialSearch={search ?? ''}
      />
    </div>
  )
}
