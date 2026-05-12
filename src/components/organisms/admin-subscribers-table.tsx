'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import type { AdminSubscriber, PaginatedResponse } from '@/lib/api/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
    initialData: PaginatedResponse<AdminSubscriber>;
    currentPage: number;
}

export function AdminSubscribersTable({ initialData, currentPage }: Props) {
    const router = useRouter();
    const [data, setData] = useState(initialData);

    async function handleDelete(subscriber: AdminSubscriber) {
        if (!confirm(`Supprimer l'abonné ${subscriber.email} ?`)) return;
        try {
            await adminApi.deleteSubscriber(subscriber.id);
            setData((prev) => ({
                ...prev,
                items: prev.items.filter((s) => s.id !== subscriber.id),
                total: prev.total - 1,
            }));
            toast.success('Abonné supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    }

    function goToPage(page: number) {
        const p = new URLSearchParams();
        p.set('page', String(page));
        router.push(`?${p.toString()}`);
    }

    return (
        <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="text-left px-4 py-3">Email</th>
                            <th className="text-left px-4 py-3">Inscrit</th>
                            <th className="text-right px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-12 text-gray-500"
                                >
                                    Aucun abonné
                                </td>
                            </tr>
                        )}
                        {data.items.map((sub) => (
                            <tr
                                key={sub.id}
                                className="hover:bg-gray-800/50 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-white">
                                    {sub.email}
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs">
                                    {formatDistanceToNow(
                                        new Date(sub.createdAt),
                                        { addSuffix: true, locale: fr }
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-gray-700"
                                            onClick={() => handleDelete(sub)}
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    {data.total === 0
                        ? '0 abonné'
                        : `${Math.min((currentPage - 1) * 20 + 1, data.total)}–${Math.min(currentPage * 20, data.total)} sur ${data.total}`}
                </span>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() => goToPage(currentPage - 1)}
                        >
                            ← Précédent
                        </Button>
                    )}
                    {data.hasNextPage && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() => goToPage(currentPage + 1)}
                        >
                            Suivant →
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
