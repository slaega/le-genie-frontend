import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/atoms/status-badge'
import { UserAvatar } from '@/components/atoms/user-avatar'
import type { Post } from '@/lib/api/types'

interface PostCardProps {
  post: Post
  href: string
  showStatus?: boolean
}

export function PostCard({ post, href, showStatus = false }: PostCardProps) {
  const owner = post.contributors.find((c) => c.owner)
  const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-border transition-colors h-full flex flex-col">
      <CardHeader className="p-0">
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
      </CardHeader>

      <CardContent className="flex-1 p-4">
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
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
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
          <span>{timeAgo}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4 flex-1">
        <div className="h-3 w-20 bg-muted rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  )
}
