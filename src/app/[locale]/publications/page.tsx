import { MainLayout } from '@/components/templates/main-layout'
import { PostsGrid } from '@/components/organisms/posts-grid'
import { serverApi } from '@/lib/api/server'
import type { PaginatedResponse, Post } from '@/lib/api/types'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { postKeys } from '@/hooks/queries/use-posts'

export const metadata = {
  title: 'Publications — Le Génie',
  description: 'Découvrez toutes les publications de la communauté',
}

export default async function PublicationsPage() {
  const qc = new QueryClient()

  try {
    await qc.prefetchQuery({
      queryKey: postKeys.list({ status: 'PUBLISHED' }),
      queryFn: () =>
        serverApi.get<PaginatedResponse<Post>>('posts?status=PUBLISHED&limit=12'),
    })
  } catch {
    // prefetch échoue gracieusement, le client refetch
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-muted-foreground mt-1">
            Découvrez les publications de la communauté
          </p>
        </div>

        <HydrationBoundary state={dehydrate(qc)}>
          <PostsGrid
            params={{ status: 'PUBLISHED', limit: 12 }}
            emptyTitle="Aucune publication"
            emptyDescription="Soyez le premier à publier sur Le Génie."
          />
        </HydrationBoundary>
      </div>
    </MainLayout>
  )
}
