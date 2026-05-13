/**
 * Internal route served by next.config.ts rewrites.
 * Browser URL:  /@handle/slug
 * Internal URL: /p/handle/slug
 *
 * `username` (handle) is cosmetic — not used for lookup.
 * `slug` is the post slug (or id) passed to the backend.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serverApi } from '@/lib/api/server';
import type { Post } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { MainLayout } from '@/components/templates/main-layout';
import { PostView } from '@/components/organisms/post-view';

type Props = {
    params: Promise<{ locale: string; username: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await serverApi.get<Post>(`posts/${slug}`);
        const owner = post.contributors.find((c) => c.owner);
        return {
            title: `${post.title} — Le Génie`,
            openGraph: {
                title: post.title,
                images: post.imagePath ? [post.imagePath] : [],
                authors: owner ? [owner.user.name] : [],
            },
        };
    } catch {
        return { title: 'Publication — Le Génie' };
    }
}

export default async function AtUserPostPage({ params }: Props) {
    const { slug } = await params;

    let post: Post;
    try {
        post = await serverApi.get<Post>(`posts/${slug}`);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    return (
        <MainLayout>
            <PostView post={post} />
        </MainLayout>
    );
}
