'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Shield, ShieldOff, UserCheck, UserX, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { adminApi } from '@/lib/api';
import type { AdminUser, PaginatedResponse } from '@/lib/api/types';
import { toast } from 'sonner';

interface Props {
    initialData: PaginatedResponse<AdminUser>;
    currentPage: number;
    initialSearch: string;
}

export function AdminUsersTable({
    initialData,
    currentPage,
    initialSearch,
}: Props) {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [search, setSearch] = useState(initialSearch);
    const [isPending, startTransition] = useTransition();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('page', '1');
        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }

    async function toggleRole(user: AdminUser) {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            const updated = await adminApi.updateUser(user.id, {
                role: newRole,
            });
            setData((prev) => ({
                ...prev,
                items: prev.items.map((u) =>
                    u.id === user.id ? { ...u, ...updated } : u
                ),
            }));
            toast.success(`Rôle mis à jour : ${newRole}`);
        } catch {
            toast.error('Erreur lors de la mise à jour du rôle');
        }
    }

    async function toggleSuspend(user: AdminUser) {
        try {
            const updated = await adminApi.updateUser(user.id, {
                suspended: !user.suspended,
            });
            setData((prev) => ({
                ...prev,
                items: prev.items.map((u) =>
                    u.id === user.id ? { ...u, ...updated } : u
                ),
            }));
            toast.success(
                user.suspended ? 'Utilisateur réactivé' : 'Utilisateur suspendu'
            );
        } catch {
            toast.error('Erreur lors de la suspension');
        }
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher nom ou email…"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    disabled={isPending}
                    className="border-gray-700 text-gray-400 hover:text-white"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="text-left px-4 py-3">Utilisateur</th>
                            <th className="text-left px-4 py-3">Rôle</th>
                            <th className="text-left px-4 py-3">Statut</th>
                            <th className="text-left px-4 py-3">Articles</th>
                            <th className="text-left px-4 py-3">Inscrit</th>
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
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        )}
                        {data.items.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-800/50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar
                                            name={user.name}
                                            avatarPath={user.avatarPath}
                                            size="sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={
                                            user.role === 'ADMIN'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className={
                                            user.role === 'ADMIN'
                                                ? 'bg-foreground text-background hover:bg-foreground'
                                                : ''
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={
                                            user.suspended
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className="text-xs"
                                    >
                                        {user.suspended ? 'Suspendu' : 'Actif'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-gray-400">
                                    {user._count.contributors}
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs">
                                    {formatDistanceToNow(
                                        new Date(user.createdAt),
                                        { addSuffix: true, locale: fr }
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                                            onClick={() => toggleRole(user)}
                                            title={
                                                user.role === 'ADMIN'
                                                    ? 'Rétrograder en USER'
                                                    : 'Promouvoir ADMIN'
                                            }
                                        >
                                            {user.role === 'ADMIN' ? (
                                                <ShieldOff className="h-4 w-4" />
                                            ) : (
                                                <Shield className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 hover:bg-gray-700 ${
                                                user.suspended
                                                    ? 'text-green-400 hover:text-green-300'
                                                    : 'text-red-400 hover:text-red-300'
                                            }`}
                                            onClick={() => toggleSuspend(user)}
                                            title={
                                                user.suspended
                                                    ? 'Réactiver'
                                                    : 'Suspendre'
                                            }
                                        >
                                            {user.suspended ? (
                                                <UserCheck className="h-4 w-4" />
                                            ) : (
                                                <UserX className="h-4 w-4" />
                                            )}
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
                    {Math.min((currentPage - 1) * 20 + 1, data.total)}–
                    {Math.min(currentPage * 20, data.total)} sur {data.total}
                </span>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() => {
                                const p = new URLSearchParams();
                                p.set('page', String(currentPage - 1));
                                if (search) p.set('search', search);
                                router.push(`?${p.toString()}`);
                            }}
                        >
                            ← Précédent
                        </Button>
                    )}
                    {data.hasNextPage && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-400 hover:text-white"
                            onClick={() => {
                                const p = new URLSearchParams();
                                p.set('page', String(currentPage + 1));
                                if (search) p.set('search', search);
                                router.push(`?${p.toString()}`);
                            }}
                        >
                            Suivant →
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
