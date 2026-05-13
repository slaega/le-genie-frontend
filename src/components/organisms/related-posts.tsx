import { serverApi } from '@/lib/api/server';
import type { Post } from '@/lib/api/types';
import { PostCard } from '@/components/molecules/post-card';
import { postUrl } from '@/lib/post-url';

interface RelatedPostsProps {
    postId: string;
}

export async function RelatedPosts({ postId }: RelatedPostsProps) {
    let posts: Post[] = [];
    try {
        const data = await serverApi.get<{ items: Post[] }>(
            `cms/posts/${postId}/related`
        );
        posts = data.items;
    } catch {
        return null;
    }
    if (!posts.length) return null;
    return (
        <section className="mt-4">
            <div className="text-center mb-8">
                <h2 className="text-[1.625rem] sm:text-[1.875rem] font-bold tracking-tight">
                    Articles similaires
                </h2>
                <p className="text-[12.5px] text-muted-foreground mt-1.5">
                    Continuez votre lecture
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                    <PostCard key={p.id} post={p} href={postUrl(p)} />
                ))}
            </div>
        </section>
    );
}
