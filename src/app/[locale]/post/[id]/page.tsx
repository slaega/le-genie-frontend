import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Metadata } from 'next'
import { serverApi } from '@/lib/api/server'
import type { Post } from '@/lib/api/types'
import { ApiError } from '@/lib/api/types'
import { BlogViewer } from '@/components/editor/blog-viewer'
import { MainLayout } from '@/components/templates/main-layout'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { StatusBadge } from '@/components/atoms/status-badge'
import { CommentsSection } from '@/components/organisms/comments-section'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const post = await serverApi.get<Post>(`posts/${id}`)
    return {
      title: `${post.title} — Le Génie`,
      openGraph: {
        title: post.title,
        images: post.imagePath ? [post.imagePath] : [],
      },
    }
  } catch {
    return { title: 'Publication — Le Génie' }
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params

  let post: Post
  try {
    post = await serverApi.get<Post>(`posts/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const owner = post.contributors.find((c) => c.owner)
  const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <MainLayout>
      <article className="max-w-3xl mx-auto">
        {post.imagePath && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={post.imagePath}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={post.status} />
            {post.postTags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>

          {owner && (
            <div className="flex items-center gap-3">
              <UserAvatar
                name={owner.user.name}
                avatarPath={owner.user.avatarPath}
                size="md"
              />
              <div>
                <p className="text-sm font-medium">{owner.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {owner.user.professionalRole && `${owner.user.professionalRole} · `}
                  Mis à jour {timeAgo}
                </p>
              </div>

              {post.contributors.length > 1 && (
                <div className="flex -space-x-2 ml-2">
                  {post.contributors
                    .filter((c) => !c.owner)
                    .slice(0, 3)
                    .map((c) => (
                      <UserAvatar
                        key={c.id}
                        name={c.user.name}
                        avatarPath={c.user.avatarPath}
                        size="sm"
                        className="ring-2 ring-background"
                      />
                    ))}
                  {post.contributors.length > 4 && (
                    <div className="h-7 w-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs text-muted-foreground">
                      +{post.contributors.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        {/* HTML généré server-side à partir du JSON TipTap — 100% SEO-friendly */}
        <BlogViewer content={post.content} className="mb-16" />

        <Separator className="mb-8" />

        <CommentsSection postId={post.id} />
      </article>
    </MainLayout>
  )
}
