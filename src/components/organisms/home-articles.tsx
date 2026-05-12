'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useInfinitePosts } from '@/hooks/queries/use-posts';
import { extractExcerpt, formatDate } from '@/lib/utils';
import type { Post } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';

// ─── Grid card ────────────────────────────────────────────────────────────────

function GridCard({ post }: { post: Post }) {
    const excerpt = extractExcerpt(post.content, 120);
    const category = post.postTags[0]?.name;
    const owner = post.contributors.find((c) => c.owner);

    return (
        <Link href={postUrl(post)} className="group flex flex-col gap-3">
            {/* Cover */}
            <div
                className="relative w-full overflow-hidden rounded-xl bg-muted"
                style={{ aspectRatio: '16/10' }}
            >
                {post.imagePath ? (
                    <Image
                        src={post.imagePath}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/8 to-muted">
                        <span className="text-5xl font-black text-primary/10 select-none">
                            {post.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Meta */}
            <p className="text-xs text-muted-foreground">
                {category && (
                    <span className="font-medium text-foreground/70">
                        {category}
                    </span>
                )}
                {category && <span className="mx-1">·</span>}
                {formatDate(post.createdAt)}
            </p>

            {/* Title */}
            <h3 className="-mt-1 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title || 'Sans titre'}
            </h3>

            {/* Excerpt */}
            {excerpt && (
                <p className="-mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {excerpt}
                </p>
            )}

            {/* Author */}
            {owner && (
                <p className="text-xs text-muted-foreground">{owner.user.name}</p>
            )}
        </Link>
    );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div
                className="w-full rounded-xl bg-muted"
                style={{ aspectRatio: '16/10' }}
            />
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="space-y-1.5">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
            <div className="h-3 w-24 bg-muted rounded" />
        </div>
    );
}

// ─── HomeArticles component ───────────────────────────────────────────────────

export function HomeArticles() {
    const { data, isLoading, isFetchingNextPage } = useInfinitePosts({
        status: 'PUBLISHED',
        limit: 6,
    });

    const posts = useMemo(
        () => data?.pages.flatMap((p) => p.items).slice(0, 6) ?? [],
        [data]
    );

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="mb-8 flex items-end justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Articles récents
                </h2>
                <Link
                    href="/publications"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Voir tout →
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
                    {posts.map((post) => (
                        <GridCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-16">
                    Aucune publication pour l&apos;instant. Soyez le premier à écrire&nbsp;!
                </p>
            )}

            {isFetchingNextPage && (
                <div className="flex justify-center mt-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            )}
        </section>
    );
}
