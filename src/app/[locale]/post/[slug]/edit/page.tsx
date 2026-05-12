import { notFound, redirect } from 'next/navigation';
import { serverApi } from '@/lib/api/server';
import type { Post, User } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { PostEditor } from '@/components/organisms/post-editor';
import { EditorLayout } from '@/components/templates/editor-layout';
import { SiteHeader } from '@/components/organisms/site-header';

// Page protégée — rendu serveur à la demande (cookies + ID dynamique).
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export const metadata = {
    title: 'Éditeur — Le Génie',
};

export default async function EditPage({ params }: Props) {
    const { id, locale } = await params;

    let post: Post;
    let me: User | null = null;

    try {
        me = await serverApi.get<User>('auth/me');
    } catch {
        redirect(`/${locale}/auth/sign-in?redirect=/post/${id}/edit`);
    }

    try {
        post = await serverApi.get<Post>(`posts/${id}`);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    const myContrib = post.contributors.find((c) => c.userId === me!.id);
    if (!myContrib) {
        redirect(`/${locale}/post/${id}`);
    }

    const isOwner = myContrib.owner;

    return (
        <EditorLayout>
            <SiteHeader />
            <PostEditor post={post} isOwner={isOwner} />
        </EditorLayout>
    );
}
