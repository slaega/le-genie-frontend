'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PostCard, PostCardSkeleton } from '@/components/molecules/post-card'
import { usePosts } from '@/hooks/queries/use-posts'
import type { Post } from '@/lib/api/types'

/**
 * A small horizontal card rendered on the dark featured background.
 * Uses explicit gray-* colors so it always looks good on bg-gray-900.
 */
function PopularCard({ post }: { post: Post }) {
  const owner = post.contributors.find((c) => c.owner)
  const category = post.postTags[0]?.name
  const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <Link href={`/post/${post.id}`} className="group flex gap-3 items-start">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-700">
        {post.imagePath ? (
          <Image
            src={post.imagePath}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-700 to-violet-900">
            <span className="text-lg font-bold text-white/40">
              {post.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {category && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            {category}
          </span>
        )}
        <h4 className="text-gray-100 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors mt-0.5">
          {post.title || 'Sans titre'}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
          {owner && <span>{owner.user.name}</span>}
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Dark "Featured" hero section — first 2 posts as large overlay cards,
 * popular posts (3-6) on the right column.
 */
export function HomeFeatured() {
  const { data, isLoading } = usePosts({ status: 'PUBLISHED', limit: 9 })

  const posts = data?.items ?? []
  const [first, second] = posts
  const popular = posts.slice(2, 6)

  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px flex-1 bg-gray-700" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            À la une
          </h2>
          <span className="h-px flex-1 bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: 2 featured cards (2/3 width) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {isLoading ? (
              <>
                <PostCardSkeleton variant="featured" />
                <PostCardSkeleton variant="featured" />
              </>
            ) : (
              <>
                {first && (
                  <PostCard
                    post={first}
                    href={`/post/${first.id}`}
                    variant="featured"
                    className="min-h-[300px]"
                  />
                )}
                {second && (
                  <PostCard
                    post={second}
                    href={`/post/${second.id}`}
                    variant="featured"
                    className="min-h-[300px]"
                  />
                )}
              </>
            )}
          </div>

          {/* Right: Popular posts (1/3 width) */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-700 pb-2 mb-4">
              Populaires
            </h3>
            <div className="flex flex-col gap-4 flex-1">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-700" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-2.5 w-12 bg-gray-700 rounded" />
                        <div className="h-3 w-full bg-gray-700 rounded" />
                        <div className="h-3 w-3/4 bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))
                : popular.map((post) => (
                    <PopularCard key={post.id} post={post} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
