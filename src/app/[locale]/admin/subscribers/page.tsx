import { serverApi } from '@/lib/api/server';
import type { AdminSubscriber, PaginatedResponse } from '@/lib/api/types';
import { AdminSubscribersTable } from '@/components/organisms/admin-subscribers-table';

export const metadata = { title: 'Abonnés — Admin — Le Génie' };

export default async function AdminSubscribersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page = '1' } = await searchParams;
    const qs = new URLSearchParams({ page, limit: '20' });

    let data: PaginatedResponse<AdminSubscriber> = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNextPage: false,
    };

    try {
        data = await serverApi.get<PaginatedResponse<AdminSubscriber>>(
            `admin/subscribers?${qs}`
        );
    } catch {
        // affiche vide
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Abonnés newsletter</h1>
                <p className="text-gray-400 text-sm mt-1">
                    {data.total.toLocaleString('fr-FR')} abonné
                    {data.total !== 1 ? 's' : ''} inscrits
                </p>
            </div>
            <AdminSubscribersTable
                initialData={data}
                currentPage={Number(page)}
            />
        </div>
    );
}
