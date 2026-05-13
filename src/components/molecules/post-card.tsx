import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MessageSquare, Users } from 'lucide-react';
import { StatusBadge } from '@/components/atoms/status-badge';
import { UserAvatar } from '@/components/atoms/user-avatar';
import type { Post } from '@/lib/api/types';
import { cn, extractExcerpt, formatDate } from '@/lib/utils';

interface PostCardProps {
    post: Post;
    href: string;
    showStatus?: boolean;
    /**
     * 'vertical'   = grid card (default)
     * 'featured'   = large overlay card (dark hero)
     * 'horizontal' = thumbnail left + text right
     * 'blog'       = Supabase-style editorial card
     */
    variant?: 'vertical' | 'featured' | 'horizontal' | 'blog';
    className?: string;
}

export function PostCard({
    post,
    href,
    showStatus = false,
    variant = 'vertical',
    className,
}: PostCardProps) {
    const owner = post.contributors.find((c) => c.owner);
    const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
        addSuffix: true,
        locale: fr,
    });
    const category = post.postTags[0]?.name;

    /* ── Featured: large card with image overlay ─────────────────────────── */
    if (variant === 'featured') {
        return (
            <Link
                href={href}
                className={cn(
                    'group relative flex overflow-hidden rounded-xl min-h-[280px]',
                    className
                )}
            >
                {/* Background image */}
                <div className="absolute inset-0">
                    {post.imagePath ? (
                        <Image
                            src={post.imagePath}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-muted" />
                    )}
                </div>

                {/* Bottom-up dark scrim for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Content */}
                <div className="relative mt-auto p-5 w-full">
                    {category && (
                        <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                            {category}
                        </span>
                    )}
                    <h3 className="text-white font-bold text-lg leading-snug line-clamp-2">
                        {post.title || 'Sans titre'}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-white/70 text-xs">
                        {owner && (
                            <>
                                <UserAvatar
                                    name={owner.user.name}
                                    avatarPath={owner.user.avatarPath}
                                    size="sm"
                                    className="h-5 w-5"
                                />
                                <span>{owner.user.name}</span>
                                <span className="text-white/40">·</span>
                            </>
                        )}
                        <span>{timeAgo}</span>
                        {post.readingTime > 0 && (
                            <>
                                <span className="text-white/40">·</span>
                                <span>{post.readingTime} min</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    /* ── Horizontal: thumbnail left + text right ─────────────────────────── */
    if (variant === 'horizontal') {
        return (
            <div className={cn('group flex gap-4 items-start', className)}>
                {/* Thumbnail */}
                <Link
                    href={href}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                    {post.imagePath ? (
                        <Image
                            src={post.imagePath}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="80px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-xl font-bold text-muted-foreground/40">
                                {post.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    {category && (
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-primary">
                            {category}
                        </span>
                    )}
                    <Link href={href} className="block">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                            {post.title || 'Sans titre'}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        {owner && <span>{owner.user.name}</span>}
                        <span>·</span>
                        <span>{timeAgo}</span>
                        {post.readingTime > 0 && (
                            <>
                                <span>·</span>
                                <span>{post.readingTime} min</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Blog: editorial card (Supabase-style) ──────────────────────────── */
    if (variant === 'blog') {
        const excerpt = extractExcerpt(post.content);
        return (
            <Link
                href={href}
                className={cn('group flex flex-col gap-4', className)}
            >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    {post.imagePath ? (
                        <Image
                            src={post.imagePath}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-5xl font-black text-muted-foreground/20 select-none">
                                {post.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {/* Category chip on image */}
                    {category && (
                        <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wider bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full border border-border/50">
                            {category}
                        </span>
                    )}
                </div>

                {/* Meta + content */}
                <div className="flex flex-col gap-2 flex-1">
                    <p className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                        {post.readingTime > 0 && (
                            <> · {post.readingTime} min de lecture</>
                        )}
                    </p>
                    <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title || 'Sans titre'}
                    </h3>
                    {excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {excerpt}
                        </p>
                    )}
                </div>

                {/* Author */}
                {owner && (
                    <div className="flex items-center gap-2 mt-auto">
                        <UserAvatar
                            name={owner.user.name}
                            avatarPath={owner.user.avatarPath}
                            size="sm"
                            className="h-6 w-6"
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                            {owner.user.name}
                        </span>
                    </div>
                )}
            </Link>
        );
    }

    /* ── Vertical (default): grid card ───────────────────────────────────── */
    return (
        <div
            className={cn(
                'group surface surface-hover overflow-hidden h-full flex flex-col',
                className
            )}
        >
            <Link href={href} className="block overflow-hidden">
                <div className="relative aspect-video bg-muted">
                    {post.imagePath ? (
                        <Image
                            src={post.imagePath}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground/30">
                                {post.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="flex-1 p-6 flex flex-col gap-3">
                {/* Plain-text status + tag labels — no chip backgrounds */}
                <div className="flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.16em]">
                    {showStatus && <StatusBadge status={post.status} />}
                    {post.postTags[0] && (
                        <span className="text-primary">
                            {post.postTags[0].name}
                        </span>
                    )}
                </div>
                <Link href={href} className="block">
                    <h3 className="font-bold text-[16.5px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title || 'Sans titre'}
                    </h3>
                </Link>
            </div>

            <div className="px-6 pb-6 flex items-center justify-between gap-3">
                {owner && (
                    <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                            name={owner.user.name}
                            avatarPath={owner.user.avatarPath}
                            size="sm"
                            className="h-7 w-7 text-[10px] shrink-0"
                        />
                        <span className="text-[12px] text-muted-foreground truncate">
                            {owner.user.name}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground ml-auto shrink-0">
                    {post.contributors.length > 1 && (
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {post.contributors.length}
                        </span>
                    )}
                    {post.readingTime > 0 && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTime} min
                        </span>
                    )}
                    {post.commentsCount > 0 && (
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.commentsCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
export function PostCardSkeleton({
    variant = 'vertical',
}: {
    variant?: PostCardProps['variant'];
}) {
    if (variant === 'blog') {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-video rounded-lg bg-muted" />
                <div className="space-y-2">
                    <div className="h-3 w-28 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
                <div className="space-y-1.5">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <div className="h-3 w-24 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (variant === 'horizontal') {
        return (
            <div className="flex gap-4 items-start">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-muted rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (variant === 'featured') {
        return (
            <div className="rounded-xl overflow-hidden min-h-[280px] bg-muted animate-pulse" />
        );
    }

    return (
        <div className="surface overflow-hidden h-full flex flex-col">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4 flex-1 space-y-2">
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
            <div className="p-4 pt-0">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </div>
        </div>
    );
}
