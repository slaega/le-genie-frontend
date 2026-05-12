import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { serverApi } from '@/lib/api/server';
import type { PaginatedResponse, Post } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';
import { MainLayout } from '@/components/templates/main-layout';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/atoms/user-avatar';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({
    searchParams,
}: Props): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Résultats pour "${q}" — Le Génie` : 'Recherche — Le Génie',
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const { q = '', page = '1' } = await searchParams;
    const p = Math.max(1, parseInt(page, 10));

    let result: PaginatedResponse<Post> | null = null;
    if (q.trim()) {
        try {
            const qs = new URLSearchParams({ q, page: String(p), limit: '12' });
            result = await serverApi.get<PaginatedResponse<Post>>(
                `cms/posts/search?${qs}`
            );
        } catch {
            result = null;
        }
    }

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-8">
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <Search className="h-6 w-6 text-muted-foreground" />
                        <h1 className="text-3xl font-bold tracking-tight">
                            Recherche
                        </h1>
                    </div>
                    {q && (
                        <p className="text-muted-foreground">
                            {result?.total
                                ? `${result.total} résultat${result.total > 1 ? 's' : ''} pour « ${q} »`
                                : `Aucun résultat pour « ${q} »`}
                        </p>
                    )}
                </header>

                {!q && (
                    <p className="text-muted-foreground">
                        Utilisez la barre de recherche en haut de la page pour
                        trouver des publications.
                    </p>
                )}

                {result && result.items.length > 0 && (
                    <ul className="space-y-6">
                        {result.items.map((post) => {
                            const owner = post.contributors.find(
                                (c) => c.owner
                            );
                            const timeAgo = formatDistanceToNow(
                                new Date(post.updatedAt),
                                {
                                    addSuffix: true,
                                    locale: fr,
                                }
                            );
                            return (
                                <li key={post.id}>
                                    <Link
                                        href={postUrl(post)}
                                        className="group flex gap-4 rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
                                    >
                                        {post.imagePath && (
                                            <div className="relative h-24 w-36 shrink-0 rounded-lg overflow-hidden">
                                                <Image
                                                    src={post.imagePath}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <h2 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                            {post.postTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {post.postTags
                                                        .slice(0, 3)
                                                        .map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            )}
                                            {owner && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <UserAvatar
                                                        name={owner.user.name}
                                                        avatarPath={
                                                            owner.user
                                                                .avatarPath
                                                        }
                                                        size="sm"
                                                    />
                                                    <span>
                                                        {owner.user.name}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{timeAgo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Pagination */}
                {result && result.total > result.limit && (
                    <div className="flex justify-center gap-4 pt-4">
                        {p > 1 && (
                            <Link
                                href={`/search?q=${encodeURIComponent(q)}&page=${p - 1}`}
                                className="text-sm text-primary hover:underline"
                            >
                                ← Page précédente
                            </Link>
                        )}
                        {result.hasNextPage && (
                            <Link
                                href={`/search?q=${encodeURIComponent(q)}&page=${p + 1}`}
                                className="text-sm text-primary hover:underline"
                            >
                                Page suivante →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
