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
    PenSquare,
    Sparkles,
    SearchX,
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
            className="group surface surface-hover flex flex-col sm:flex-row overflow-hidden mb-10"
        >
            {/* Image */}
            <div className="relative sm:w-[48%] aspect-[4/3] sm:aspect-auto bg-muted shrink-0 overflow-hidden">
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
                    <div className="w-full h-full bg-muted" />
                )}
            </div>

            {/* Content — generous padding, plain-text category */}
            <div className="flex-1 p-7 sm:p-10 flex flex-col justify-center gap-4 min-w-0">
                {category && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                        {category}
                    </span>
                )}
                <h2 className="text-[22px] sm:text-[28px] font-bold leading-[1.2] tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-3">
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
            className="group surface surface-hover flex flex-col overflow-hidden"
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
                    <div className="w-full h-full bg-muted" />
                )}
            </div>

            {/* Content — extra padding, plain-text category */}
            <div className="p-6 flex flex-col gap-3 flex-1">
                {category && (
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-primary">
                        {category}
                    </span>
                )}
                <h3 className="text-[16.5px] font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title || 'Sans titre'}
                </h3>
                {excerpt && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                        {excerpt}
                    </p>
                )}

                {/* Footer — no border, more breathing room */}
                <div className="flex items-center gap-2.5 mt-3">
                    {owner && (
                        <>
                            <UserAvatar
                                name={owner.user.name}
                                avatarPath={owner.user.avatarPath}
                                size="sm"
                                className="h-7 w-7 text-[10px] shrink-0"
                            />
                            <span className="text-[12px] text-muted-foreground truncate flex-1">
                                {owner.user.name}
                                {post.readingTime > 0 && (
                                    <span className="ml-1 text-muted-foreground/50">
                                        · {post.readingTime} min
                                    </span>
                                )}
                            </span>
                        </>
                    )}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-auto" />
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
                    <EmptyResults
                        onReset={() => {
                            setActiveTag(null);
                            setSearch('');
                        }}
                    />
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

                        {/*
                         * Sparse-state filler — when there are < 3 posts total
                         * the page feels empty. We complete the grid with
                         * "Coming soon" placeholder cards (subtle, dashed) so
                         * the visual density holds, plus an encouragement CTA
                         * at the end.
                         */}
                        {filtered.length < 3 && !hasNextPage && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                                    {Array.from({
                                        length: 3 - filtered.length,
                                    }).map((_, i) => (
                                        <ComingSoonCard key={i} index={i} />
                                    ))}
                                </div>
                                <ContributeCta />
                            </>
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

/* ── Empty state — no results for the current filter ─────────────────────── */

function EmptyResults({ onReset }: { onReset: () => void }) {
    return (
        <div className="surface text-center py-20 px-8">
            <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-5">
                <SearchX
                    className="h-5 w-5 text-muted-foreground"
                    strokeWidth={1.6}
                />
            </div>
            <h3 className="text-[16px] font-bold text-foreground mb-1.5">
                Aucun article trouvé
            </h3>
            <p className="text-[13px] text-muted-foreground max-w-xs mx-auto leading-relaxed mb-5">
                Essayez d&apos;élargir vos critères ou explorez d&apos;autres
                catégories.
            </p>
            <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
            >
                Réinitialiser les filtres
            </button>
        </div>
    );
}

/* ── Coming-soon placeholder card — fills sparse listings without lying ── */

function ComingSoonCard({ index }: { index: number }) {
    const lines = [
        'Un nouvel article arrive bientôt',
        'La communauté écrit en ce moment',
        'Restez à l’écoute',
    ];
    const line = lines[index % lines.length];

    return (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 flex flex-col overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 via-muted/30 to-transparent flex items-center justify-center">
                <Sparkles
                    className="h-6 w-6 text-muted-foreground/30 animate-pulse"
                    strokeWidth={1.5}
                    style={{ animationDelay: `${index * 400}ms` }}
                />
            </div>
            <div className="p-6 flex flex-col gap-2.5 flex-1">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
                    Bientôt
                </span>
                <p className="text-[15px] font-bold leading-snug text-foreground/40">
                    {line}
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <div className="h-7 w-7 rounded-full bg-muted/60 shrink-0" />
                    <div className="h-3 w-24 rounded bg-muted/60" />
                </div>
            </div>
        </div>
    );
}

/* ── Contribute CTA — surfaces at the bottom of sparse listings ──────────── */

function ContributeCta() {
    return (
        <div className="surface mt-10 px-8 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-primary mb-2">
                    Vous avez quelque chose à dire&nbsp;?
                </p>
                <h3 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground leading-snug">
                    Votre prochain article peut faire partie de cette page.
                </h3>
                <p className="text-[13.5px] text-muted-foreground mt-2 leading-relaxed max-w-md">
                    Inscrivez-vous gratuitement et publiez votre premier article
                    en quelques minutes — sans paywall, sans publicité.
                </p>
            </div>
            <Link
                href="/auth/sign-in?redirect=/me"
                className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-[13px] font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all"
            >
                <PenSquare className="h-4 w-4" />
                Commencer à écrire
            </Link>
        </div>
    );
}
