'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import {
    Search,
    ArrowUpRight,
    Loader2,
    ChevronDown,
    SlidersHorizontal,
} from 'lucide-react';
import { useInfinitePosts } from '@/hooks/queries/use-posts';
import { cn, extractExcerpt } from '@/lib/utils';
import { UserAvatar } from '@/components/atoms/user-avatar';
import type { Post } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';

/* ── Sort options ────────────────────────────────────────────────────────── */

const SORT_OPTIONS = [
    { label: 'Plus récents', value: 'recent' },
    { label: 'Lecture rapide', value: 'short' },
    { label: 'Plus anciens', value: 'oldest' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

/* ── Featured card ───────────────────────────────────────────────────────── */

function FeaturedCard({ post }: { post: Post }) {
    const excerpt = extractExcerpt(post.content, 120);
    const category = post.postTags[0]?.name;
    const owner = post.contributors.find((c) => c.owner);

    return (
        <Link
            href={postUrl(post)}
            className="group flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-border/60 hover:shadow-md hover:border-border transition-all duration-200 mb-7 bg-background"
        >
            {/* Image */}
            <div className="relative sm:w-[52%] aspect-[4/3] sm:aspect-auto bg-muted shrink-0 overflow-hidden">
                {post.imagePath ? (
                    <Image
                        src={post.imagePath}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 640px) 50vw, 100vw"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 via-muted to-muted/60" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-3 min-w-0">
                {category && (
                    <span className="inline-flex text-[11px] font-bold text-foreground/60 uppercase tracking-wider">
                        {category}
                    </span>
                )}
                <h2 className="text-[22px] sm:text-[26px] font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {post.title || 'Sans titre'}
                </h2>
                {excerpt && (
                    <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                        {excerpt}
                    </p>
                )}
                {owner && (
                    <div className="flex items-center gap-2.5 mt-2">
                        <UserAvatar
                            name={owner.user.name}
                            avatarPath={owner.user.avatarPath}
                            size="sm"
                            className="h-7 w-7 text-[11px] shrink-0"
                        />
                        <div>
                            <p className="text-[12px] font-medium text-foreground leading-none">
                                {owner.user.name}
                            </p>
                            {post.readingTime > 0 && (
                                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                    {post.readingTime} min de lecture
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

/* ── Grid card ───────────────────────────────────────────────────────────── */

function GridCard({ post }: { post: Post }) {
    const excerpt = extractExcerpt(post.content, 100);
    const category = post.postTags[0]?.name;
    const owner = post.contributors.find((c) => c.owner);

    return (
        <Link
            href={postUrl(post)}
            className="group flex flex-col rounded-xl overflow-hidden border border-border/60 hover:shadow-md hover:border-border bg-background transition-all duration-200"
        >
            {/* Cover */}
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {post.imagePath ? (
                    <Image
                        src={post.imagePath}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(min-width: 768px) 33vw, 50vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 via-muted to-muted/60" />
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                {category && (
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">
                        {category}
                    </span>
                )}
                <h3 className="text-[15px] font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title || 'Sans titre'}
                </h3>
                {excerpt && (
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                        {excerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/40">
                    {owner && (
                        <>
                            <UserAvatar
                                name={owner.user.name}
                                avatarPath={owner.user.avatarPath}
                                size="sm"
                                className="h-6 w-6 text-[9px] shrink-0"
                            />
                            <span className="text-[11px] text-muted-foreground truncate flex-1">
                                {owner.user.name}
                                {post.readingTime > 0 && (
                                    <span className="ml-1 text-muted-foreground/50">
                                        · {post.readingTime} min
                                    </span>
                                )}
                            </span>
                        </>
                    )}
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0 ml-auto" />
                </div>
            </div>
        </Link>
    );
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */

function SkeletonFeatured() {
    return (
        <div className="flex rounded-2xl overflow-hidden border border-border/40 mb-7 animate-pulse">
            <div className="w-[52%] aspect-[4/3] bg-muted shrink-0" />
            <div className="flex-1 p-8 space-y-4">
                <div className="h-2.5 w-16 bg-muted rounded-full" />
                <div className="h-7 w-full bg-muted rounded" />
                <div className="h-7 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="flex items-center gap-2 mt-4">
                    <div className="h-7 w-7 rounded-full bg-muted" />
                    <div className="h-3 w-28 bg-muted rounded" />
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border/40 overflow-hidden animate-pulse">
            <div className="aspect-[16/10] bg-muted" />
            <div className="p-4 space-y-2.5">
                <div className="h-2.5 w-14 bg-muted rounded-full" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
        </div>
    );
}

/* ── BlogPage ─────────────────────────────────────────────────────────────── */

export interface CmsTag {
    name: string;
    count: number;
}

interface BlogPageProps {
    allTags: CmsTag[];
}

export function BlogPage({ allTags }: BlogPageProps) {
    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [sort, setSort] = useState<SortOption>('recent');

    /* Server-side tag filter — correct pagination per category */
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfinitePosts({
            status: 'PUBLISHED',
            limit: 12,
            tags: activeTag ? [activeTag] : undefined,
        });

    const allPosts = useMemo(
        () => data?.pages.flatMap((p) => p.items) ?? [],
        [data]
    );

    /* Client-side: text search + sort */
    const filtered = useMemo(() => {
        let posts = allPosts;

        if (search.trim()) {
            const q = search.toLowerCase();
            posts = posts.filter((p) => p.title.toLowerCase().includes(q));
        }

        switch (sort) {
            case 'oldest':
                return [...posts].reverse();
            case 'short':
                return [...posts].sort(
                    (a, b) => (a.readingTime || 99) - (b.readingTime || 99)
                );
            default:
                return posts;
        }
    }, [allPosts, search, sort]);

    const [featured, ...rest] = filtered;

    return (
        <div className="flex gap-8 xl:gap-10 items-start">
            {/* ── Left sidebar ─────────────────────────────────────────── */}
            <aside className="w-52 shrink-0 hidden lg:flex flex-col gap-7 sticky top-28">
                {/* Search */}
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2.5">
                        Rechercher
                    </p>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Titre d'article…"
                            className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-muted/30 text-[12px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-foreground/25 transition-colors"
                        />
                    </div>
                </div>

                {/* Sort */}
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2.5">
                        Trier
                    </p>
                    <div className="relative">
                        <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(e.target.value as SortOption)
                            }
                            className="w-full h-9 pl-8 pr-7 rounded-lg border border-border bg-muted/30 text-[12px] text-foreground focus:outline-none focus:border-foreground/25 transition-colors appearance-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                    </div>
                </div>

                {/* Categories */}
                {allTags.length > 0 && (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2.5">
                            Catégories
                        </p>
                        <nav className="flex flex-col gap-0.5">
                            {[
                                { name: null, label: 'Tous les articles' },
                                ...allTags.map((t) => ({
                                    name: t.name,
                                    label: t.name,
                                })),
                            ].map(({ name, label }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setActiveTag(name)}
                                    className={cn(
                                        'flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] text-left transition-all duration-100 border-l-2',
                                        activeTag === name
                                            ? 'border-l-foreground text-foreground font-medium bg-muted/50'
                                            : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </aside>

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {/* Mobile: horizontal category pills */}
                {allTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-4 mb-2 lg:hidden">
                        {[
                            { name: null, label: 'Tout' },
                            ...allTags.map((t) => ({
                                name: t.name,
                                label: t.name,
                            })),
                        ].map(({ name, label }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setActiveTag(name)}
                                className={cn(
                                    'px-3.5 py-1.5 rounded-full text-[12px] whitespace-nowrap shrink-0 transition-all duration-150 border',
                                    activeTag === name
                                        ? 'bg-foreground text-background border-foreground font-medium'
                                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <>
                        <SkeletonFeatured />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Aucun article trouvé.
                        </p>
                        <button
                            onClick={() => {
                                setActiveTag(null);
                                setSearch('');
                            }}
                            className="text-xs text-primary hover:underline underline-offset-4"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Featured post */}
                        {featured && <FeaturedCard post={featured} />}

                        {/* Grid */}
                        {rest.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {rest.map((post) => (
                                    <GridCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}

                        {/* Load more */}
                        {hasNextPage && (
                            <div className="flex justify-center pt-10">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-150 disabled:opacity-40"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Chargement…
                                        </>
                                    ) : (
                                        "Voir plus d'articles"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
