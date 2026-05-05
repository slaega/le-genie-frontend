import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { SiteHeader } from '@/components/organisms/site-header'
import { HomeFeatured } from '@/components/organisms/home-featured'
import { HomeRecent } from '@/components/organisms/home-recent'
import { HomeSidebar } from '@/components/organisms/home-sidebar'
import { serverApi } from '@/lib/api/server'
import { postKeys } from '@/hooks/queries/use-posts'
import type { PaginatedResponse, Post } from '@/lib/api/types'
import { SiteFooter } from '@/components/templates/site-footer'

export const metadata: Metadata = {
  title: 'Le Génie — Plateforme de publication collaborative',
  description: 'Découvrez et partagez des publications techniques avec la communauté.',
  openGraph: {
    title: 'Le Génie',
    description: 'Découvrez et partagez des publications techniques avec la communauté.',
  },
}

type Props = { searchParams: Promise<{ tags?: string }> }

export default async function HomePage({ searchParams }: Props) {
  const { tags } = await searchParams
  const tagList = tags ? tags.split(',').filter(Boolean) : []

  const qc = new QueryClient()

  try {
    await qc.prefetchQuery({
      queryKey: postKeys.list({ status: 'PUBLISHED', limit: 9, tags: tagList.length ? tagList : undefined }),
      queryFn: () => {
        const qs = new URLSearchParams({ status: 'PUBLISHED', limit: '9' })
        tagList.forEach((t) => qs.append('tags', t))
        return serverApi.get<PaginatedResponse<Post>>(`posts?${qs.toString()}`)
      },
    })
  } catch {
    // prefetch échoue silencieusement — le client refetch
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <HydrationBoundary state={dehydrate(qc)}>
        {/* Dark featured hero */}
        <HomeFeatured tags={tagList.length ? tagList : undefined} />

        {/* Main content + sidebar */}
        <main className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Recently posted — takes 2/3 */}
            <div className="lg:col-span-2">
              <HomeRecent tags={tagList.length ? tagList : undefined} />
            </div>

            {/* Sidebar — takes 1/3 */}
            <div>
              <HomeSidebar />
            </div>
          </div>
        </main>
      </HydrationBoundary>

      <SiteFooter />
    </div>
  )
}
