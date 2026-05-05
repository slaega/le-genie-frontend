import { serverApi } from '@/lib/api/server'
import type { Post } from '@/lib/api/types'
import { PostCard } from '@/components/molecules/post-card'

interface RelatedPostsProps { postId: string }

export async function RelatedPosts({ postId }: RelatedPostsProps) {
  let posts: Post[] = []
  try {
    const data = await serverApi.get<{ items: Post[] }>(`cms/posts/${postId}/related`)
    posts = data.items
  } catch { return null }
  if (!posts.length) return null
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6">Articles similaires</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} href={`/post/${p.id}`} />
        ))}
      </div>
    </section>
  )
}
