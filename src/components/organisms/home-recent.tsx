'use client';

import { PostCard, PostCardSkeleton } from '@/components/molecules/post-card';
import { usePosts } from '@/hooks/queries/use-posts';
import { postUrl } from '@/lib/post-url';

interface HomeRecentProps {
    tags?: string[];
}

/**
 * "Recently Posted" section — horizontal cards, offset past the featured posts.
 */
export function HomeRecent({ tags }: HomeRecentProps) {
    const { data, isLoading } = usePosts({
        status: 'PUBLISHED',
        limit: 9,
        tags,
    });

    const recent = data?.items.slice(6) ?? [];

    if (!isLoading && recent.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold shrink-0">
                    Récemment publiés
                </h2>
                <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-6">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <PostCardSkeleton key={i} variant="horizontal" />
                      ))
                    : recent.map((post) => (
                          <PostCard
                              key={post.id}
                              post={post}
                              href={postUrl(post)}
                              variant="horizontal"
                          />
                      ))}
            </div>
        </section>
    );
}
