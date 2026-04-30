import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { MainLayout } from '@/components/templates/main-layout'
import { PostsGrid } from '@/components/organisms/posts-grid'
import { serverApi } from '@/lib/api/server'
import { postKeys } from '@/hooks/queries/use-posts'
import type { PaginatedResponse, Post } from '@/lib/api/types'

export const metadata: Metadata = {
  title: 'Le Génie — Plateforme de publication collaborative',
  description: 'Découvrez et partagez des publications techniques avec la communauté.',
  openGraph: {
    title: 'Le Génie',
    description: 'Découvrez et partagez des publications techniques avec la communauté.',
  },
}

export default async function HomePage() {
  const qc = new QueryClient()

  try {
    await qc.prefetchQuery({
      queryKey: postKeys.list({ status: 'PUBLISHED', limit: 9 }),
      queryFn: () =>
        serverApi.get<PaginatedResponse<Post>>('posts?status=PUBLISHED&limit=9'),
    })
  } catch {
    // prefetch échoue silencieusement — le client refetch
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        <div className="text-center space-y-3 py-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Bienvenue sur Le Génie
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Une plateforme collaborative pour partager vos idées, tutoriels et articles techniques.
          </p>
        </div>

        <HydrationBoundary state={dehydrate(qc)}>
          <PostsGrid
            params={{ status: 'PUBLISHED', limit: 9 }}
            emptyTitle="Aucune publication pour l'instant"
            emptyDescription="Soyez le premier à publier sur Le Génie."
          />
        </HydrationBoundary>
      </div>
    </MainLayout>
  )
}
