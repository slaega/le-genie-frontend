'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Archive, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import type { AdminPost, PaginatedResponse, PostStatus } from '@/lib/api/types';
import { toast } from 'sonner';

interface Props {
    initialData: PaginatedResponse<AdminPost>;
    currentPage: number;
    initialStatus: string;
    initialSearch: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'PUBLISHED', label: 'Publiés' },
    { value: 'DRAFT', label: 'Brouillons' },
    { value: 'ARCHIVED', label: 'Archivés' },
    { value: 'EMPTY', label: 'Vides' },
];

function statusBadge(status: PostStatus) {
    switch (status) {
        case 'PUBLISHED':
            return (
                <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/20">
                    Publié
                </Badge>
            );
        case 'DRAFT':
            return (
                <Badge className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/20">
                    Brouillon
                </Badge>
            );
        case 'ARCHIVED':
            return (
                <Badge className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/20">
                    Archivé
                </Badge>
            );
        case 'EMPTY':
            return (
                <Badge variant="outline" className="text-gray-600">
                    Vide
                </Badge>
            );
    }
}

export function AdminPostsTable({
    initialData,
    currentPage,
    initialStatus,
    initialSearch,
}: Props) {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [, startTransition] = useTransition();

    function pushParams(overrides: {
        page?: number;
        search?: string;
        status?: string;
    }) {
        const p = new URLSearchParams();
        const s = overrides.search ?? search;
        const st = overrides.status ?? status;
        const pg = overrides.page ?? 1;
        if (s) p.set('search', s);
        if (st) p.set('status', st);
        p.set('page', String(pg));
        router.push(`?${p.toString()}`);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        pushParams({ page: 1 });
    }

    function handleStatusChange(value: string) {
        setStatus(value);
        startTransition(() => {
            const p = new URLSearchParams();
            if (search) p.set('search', search);
            if (value) p.set('status', value);
            p.set('page', '1');
            router.push(`?${p.toString()}`);
        });
    }

    async function handleArchive(post: AdminPost) {
        if (post.status === 'ARCHIVED') return;
        try {
            await adminApi.archivePost(post.id);
            setData((prev) => ({
                ...prev,
                items: prev.items.map((p) =>
                    p.id === post.id
                        ? { ...p, status: 'ARCHIVED' as PostStatus }
                        : p
                ),
            }));
            toast.success('Article archivé');
        } catch {
            toast.error("Erreur lors de l'archivage");
        }
    }

    async function handleDelete(post: AdminPost) {
        if (
            !confirm(
                `Supprimer définitivement « ${post.title || 'Sans titre'} » ?`
            )
        )
            return;
        try {
            await adminApi.deletePost(post.id);
            setData((prev) => ({
                ...prev,
                items: prev.items.filter((p) => p.id !== post.id),
                total: prev.total - 1,
            }));
            toast.success('Article supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un titre…"
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        className="border-gray-700 text-gray-400 hover:text-white"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </form>

                <div className="flex gap-1 flex-wrap">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleStatusChange(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                status === opt.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="text-left px-4 py-3">Titre</th>
                            <th className="text-left px-4 py-3">Auteur</th>
                            <th className="text-left px-4 py-3">Statut</th>
                            <th className="text-left px-4 py-3">
                                Commentaires
                            </th>
                            <th className="text-left px-4 py-3">Mis à jour</th>
                            <th className="text-right px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-12 text-gray-500"
                                >
                                    Aucun article trouvé
                                </td>
                            </tr>
                        )}
                        {data.items.map((post) => {
                            const owner =
                                post.contributors.find(
                                    (c) =>
                                        (c as unknown as { owner: boolean })
                                            .owner
                                )?.user ?? post.contributors[0]?.user;

                            return (
                                <tr
                                    key={post.id}
                                    className="hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 max-w-xs">
                                        <p className="font-medium truncate text-white">
                                            {post.title || (
                                                <span className="text-gray-500 italic">
                                                    Sans titre
                                                </span>
                                            )}
                                        </p>
                                        {post.readingTime && (
                                            <p className="text-xs text-gray-500">
                                                {post.readingTime} min de
                                                lecture
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {owner ? (
                                            <div>
                                                <p className="text-white font-medium">
                                                    {owner.name}
                                                </p>
                                                <p className="text-gray-500">
                                                    {owner.email}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {statusBadge(post.status)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {post._count.comments}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {formatDistanceToNow(
                                            new Date(post.updatedAt),
                                            { addSuffix: true, locale: fr }
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-7 w-7 hover:bg-gray-700 ${
                                                    post.status === 'ARCHIVED'
                                                        ? 'text-gray-600 cursor-not-allowed'
                                                        : 'text-yellow-400 hover:text-yellow-300'
                                                }`}
                                                onClick={() =>
                                                    handleArchive(post)
                                                }
                                                disabled={
                                                    post.status === 'ARCHIVED'
                                                }
                                                title="Archiver"
                                            >
                                                <Archive className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-gray-700"
                                                onClick={() =>
                                                    handleDelete(post)
                                                }
                                                title="Supprimer définitivement"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    {data.total === 0
                        ? '0 article'
                        : `${Math.min((currentPage - 1) * 20 + 1, data.total)}–${Math.min(currentPage * 20, data.total)} sur ${data.total}`}
                </span>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() =>
                                pushParams({ page: currentPage - 1 })
                            }
                        >
                            ← Précédent
                        </Button>
                    )}
                    {data.hasNextPage && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() =>
                                pushParams({ page: currentPage + 1 })
                            }
                        >
                            Suivant →
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
