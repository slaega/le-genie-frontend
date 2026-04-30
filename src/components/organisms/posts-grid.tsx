'use client'

import { PostCard, PostCardSkeleton } from '@/components/molecules/post-card'
import { EmptyState } from '@/components/atoms/empty-state'
import { Button } from '@/components/ui/button'
import { usePosts } from '@/hooks/queries/use-posts'
import { useCreatePost } from '@/hooks/mutations/use-create-post'
import { useAuth } from '@/providers/auth-provider'
import { BookOpen, PenSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { PostsQueryParams } from '@/lib/api/types'

interface PostsGridProps {
  params?: PostsQueryParams
  showStatus?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function PostsGrid({
  params,
  showStatus = false,
  emptyTitle = 'Aucune publication',
  emptyDescription = 'Il n\'y a pas encore de publications.',
}: PostsGridProps) {
  const { data, isLoading } = usePosts(params)
  const { isAuthenticated } = useAuth()
  const { mutateAsync: createPost, isPending } = useCreatePost()
  const router = useRouter()

  async function handleNew() {
    try {
      const post = await createPost()
      router.push(`/post/${post.id}/edit`)
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data?.items.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
        action={
          isAuthenticated ? (
            <Button className="gap-2" onClick={handleNew} disabled={isPending}>
              <PenSquare className="h-4 w-4" />
              {isPending ? 'Création...' : 'Créer une publication'}
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.items.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          href={`/post/${post.id}`}
          showStatus={showStatus}
        />
      ))}
    </div>
  )
}
