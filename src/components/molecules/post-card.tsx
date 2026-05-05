import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, MessageSquare, Users } from 'lucide-react'
import { StatusBadge } from '@/components/atoms/status-badge'
import { UserAvatar } from '@/components/atoms/user-avatar'
import type { Post } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
  href: string
  showStatus?: boolean
  /** 'vertical' = grid card (default), 'featured' = large overlay card, 'horizontal' = thumbnail + text */
  variant?: 'vertical' | 'featured' | 'horizontal'
  className?: string
}

export function PostCard({
  post,
  href,
  showStatus = false,
  variant = 'vertical',
  className,
}: PostCardProps) {
  const owner = post.contributors.find((c) => c.owner)
  const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
    addSuffix: true,
    locale: fr,
  })
  const category = post.postTags[0]?.name

  /* ── Featured: large card with image overlay ─────────────────────────── */
  if (variant === 'featured') {
    return (
      <Link
        href={href}
        className={cn(
          'group relative flex overflow-hidden rounded-xl min-h-[280px]',
          className,
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-violet-900" />
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative mt-auto p-5 w-full">
          {category && (
            <span className="inline-block mb-2 text-xs font-bold uppercase tracking-wider bg-blue-500 text-white px-2.5 py-0.5 rounded">
              {category}
            </span>
          )}
          <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
            {post.title || 'Sans titre'}
          </h3>
          <div className="flex items-center gap-2 mt-3 text-gray-300 text-xs">
            {owner && (
              <>
                <UserAvatar
                  name={owner.user.name}
                  avatarPath={owner.user.avatarPath}
                  size="sm"
                  className="h-5 w-5"
                />
                <span>{owner.user.name}</span>
                <span className="text-gray-500">•</span>
              </>
            )}
            <span>{timeAgo}</span>
            {post.readingTime > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span>{post.readingTime} min</span>
              </>
            )}
          </div>
        </div>
      </Link>
    )
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-violet-500/20">
              <span className="text-xl font-bold text-primary/40">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
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
            <span>•</span>
            <span>{timeAgo}</span>
            {post.readingTime > 0 && (
              <>
                <span>•</span>
                <span>{post.readingTime} min</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Vertical (default): grid card ───────────────────────────────────── */
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border border-border/50 hover:border-border transition-colors h-full flex flex-col bg-card',
        className,
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          {showStatus && <StatusBadge status={post.status} />}
          {post.postTags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <Link href={href} className="block">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title || 'Sans titre'}
          </h3>
        </Link>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between">
        {owner && (
          <div className="flex items-center gap-2">
            <UserAvatar name={owner.user.name} avatarPath={owner.user.avatarPath} size="sm" />
            <span className="text-xs text-muted-foreground">{owner.user.name}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
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
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
export function PostCardSkeleton({ variant = 'vertical' }: { variant?: PostCardProps['variant'] }) {
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
    )
  }

  if (variant === 'featured') {
    return (
      <div className="rounded-xl overflow-hidden min-h-[280px] bg-muted animate-pulse" />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 h-full flex flex-col">
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
  )
}
