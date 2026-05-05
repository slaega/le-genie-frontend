'use client'

import { PostCard, PostCardSkeleton } from '@/components/molecules/post-card'
import { EmptyState } from '@/components/atoms/empty-state'
import { Button } from '@/components/ui/button'
import { useInfinitePosts } from '@/hooks/queries/use-posts'
import { BookOpen, Loader2 } from 'lucide-react'
import type { PostsQueryParams } from '@/lib/api/types'

interface InfinitePostsGridProps {
  params?: Omit<PostsQueryParams, 'page'>
  showStatus?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function InfinitePostsGrid({
  params,
  showStatus = false,
  emptyTitle = 'Aucune publication',
  emptyDescription = "Il n'y a pas encore de publications.",
}: InfinitePostsGridProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts(params)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const posts = data?.pages.flatMap((p) => p.items) ?? []

  if (!posts.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            href={`/post/${post.id}`}
            showStatus={showStatus}
          />
        ))}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-40"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement…
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}

      {/* End of results */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          Vous avez vu toutes les publications ({posts.length})
        </p>
      )}
    </div>
  )
}
