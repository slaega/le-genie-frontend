'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInfinitePosts } from '@/hooks/queries/use-posts';
import { cn, extractExcerpt, formatDate } from '@/lib/utils';
import type { Post } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';

// ─── How many articles appear in the grid vs the simple list ─────────────────
const GRID_COUNT = 6;

// ─── Filter tabs — Linear-style flat underline ────────────────────────────────

function FilterTabs({
    tags,
    active,
    onChange,
}: {
    tags: string[];
    active: string | null;
    onChange: (tag: string | null) => void;
}) {
    const items = [
        { label: 'Tout', value: null as string | null },
        ...tags.map((t) => ({ label: t, value: t })),
    ];
    return (
        <div className="flex items-center border-b border-border overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            {items.map(({ label, value }) => {
                const isActive = active === value;
                return (
                    <button
                        key={label}
                        onClick={() => onChange(value)}
                        className={cn(
                            'relative px-4 py-2.5 text-sm whitespace-nowrap shrink-0 transition-colors duration-150',
                            isActive
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Grid card (recent articles) ─────────────────────────────────────────────

function GridCard({ post }: { post: Post }) {
    const excerpt = extractExcerpt(post.content, 120);
    const category = post.postTags[0]?.name;
    const owner = post.contributors.find((c) => c.owner);

    return (
        <Link href={postUrl(post)} className="group flex flex-col gap-3">
            {/* Cover */}
            <div className="relative w-full overflow-hidden rounded-xl bg-muted" style={{ aspectRatio: '16/10' }}>
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

            {/* Meta above title */}
            <p className="text-xs text-muted-foreground">
                {category && (
                    <span className="font-medium text-foreground/70">{category}</span>
                )}
                {category && <span className="mx-1">·</span>}
                {formatDate(post.createdAt)}
            </p>

            {/* Title */}
            <h2 className="-mt-1 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title || 'Sans titre'}
            </h2>

            {/* Excerpt */}
            {excerpt && (
                <p className="-mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {excerpt}
                </p>
            )}

            {/* Author */}
            {owner && (
                <p className="text-xs text-muted-foreground">
                    {owner.user.name}
                    {post.readingTime > 0 && (
                        <><span className="mx-1">·</span>{post.readingTime} min</>
                    )}
                </p>
            )}
        </Link>
    );
}

// ─── List row (older articles) ────────────────────────────────────────────────

function ListRow({ post }: { post: Post }) {
    const owner = post.contributors.find((c) => c.owner);

    return (
        <Link
            href={postUrl(post)}
            className="group flex items-baseline justify-between gap-4 py-3.5 border-t border-border/60 hover:border-border transition-colors"
        >
            <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors line-clamp-1 flex-1 min-w-0">
                {post.title || 'Sans titre'}
            </span>
            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                {owner && <>{owner.user.name}<span className="mx-1.5">·</span></>}
                {formatDate(post.createdAt)}
            </span>
        </Link>
    );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div className="w-full rounded-xl bg-muted" style={{ aspectRatio: '16/10' }} />
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

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5 border-t border-border/60 animate-pulse">
            <div className="h-3.5 w-1/2 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
        </div>
    );
}

// ─── Main BlogPage component ──────────────────────────────────────────────────

export function BlogPage() {
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfinitePosts({ status: 'PUBLISHED', limit: 12 });

    const allPosts = useMemo(
        () => data?.pages.flatMap((p) => p.items) ?? [],
        [data]
    );

    const allTags = useMemo(() => {
        const seen = new Set<string>();
        allPosts.forEach((p) => p.postTags.forEach((t) => seen.add(t.name)));
        return Array.from(seen).slice(0, 10);
    }, [allPosts]);

    const filtered = useMemo(() => {
        if (!activeTag) return allPosts;
        return allPosts.filter((p) =>
            p.postTags.some((t) => t.name === activeTag)
        );
    }, [allPosts, activeTag]);

    const gridPosts = filtered.slice(0, GRID_COUNT);
    const listPosts = filtered.slice(GRID_COUNT);

    return (
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-24">
            {/* Page header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                    Publications
                </h1>
                <p className="text-base text-muted-foreground">
                    Articles, tutoriels et ressources pour apprendre et progresser ensemble.
                </p>
            </div>

            {/* Filter tabs */}
            <FilterTabs tags={allTags} active={activeTag} onChange={setActiveTag} />

            {/* ── Grid — recent articles ── */}
            {isLoading ? (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : gridPosts.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
                    {gridPosts.map((post) => <GridCard key={post.id} post={post} />)}
                </div>
            ) : !isLoading && filtered.length === 0 ? (
                <div className="text-center py-24 space-y-2">
                    <p className="text-muted-foreground">
                        Aucune publication dans cette catégorie pour l&apos;instant.
                    </p>
                    <button
                        onClick={() => setActiveTag(null)}
                        className="text-xs text-primary/80 hover:text-primary underline underline-offset-4 transition-colors"
                    >
                        Voir toutes les publications
                    </button>
                </div>
            ) : null}

            {/* ── List — older articles ── */}
            {isLoading ? (
                <div className="mt-12">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : listPosts.length > 0 ? (
                <div className="mt-12">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                        Archives
                    </p>
                    {listPosts.map((post) => <ListRow key={post.id} post={post} />)}
                </div>
            ) : null}

            {/* Load more */}
            {hasNextPage && (
                <div className="flex justify-center mt-14">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="min-w-36 rounded-full"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Chargement…
                            </>
                        ) : (
                            'Charger plus'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
