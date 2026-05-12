import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { serverApi } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { Post } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';
import { MainLayout } from '@/components/templates/main-layout';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { PostCard } from '@/components/molecules/post-card';
import { FollowButton } from '@/components/molecules/follow-button';
import { Users } from 'lucide-react';

interface AuthorProfile {
    id: string;
    name: string;
    avatarPath: string | null;
    coverPath: string | null;
    professionalRole: string | null;
    followersCount: number;
    posts: Post[];
}

type Props = {
    params: Promise<{ locale: string; authorId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { authorId } = await params;
    try {
        const author = await serverApi.get<AuthorProfile>(
            `cms/authors/${authorId}`
        );
        return {
            title: `${author.name} — Le Génie`,
            description: author.professionalRole ?? undefined,
        };
    } catch {
        return { title: 'Auteur — Le Génie' };
    }
}

export default async function AuthorPage({ params }: Props) {
    const { authorId } = await params;

    let author: AuthorProfile;
    try {
        author = await serverApi.get<AuthorProfile>(`cms/authors/${authorId}`);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    return (
        <MainLayout>
            {/* Hero header */}
            <div className="relative -mx-4 -mt-8 mb-10">
                {/* Cover */}
                <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-blue-700 to-violet-900">
                    {author.coverPath && (
                        <Image
                            src={author.coverPath}
                            alt={`Couverture de ${author.name}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                {/* Avatar + info overlay */}
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 pb-6">
                        <UserAvatar
                            name={author.name}
                            avatarPath={author.avatarPath}
                            size="lg"
                            className="h-24 w-24 text-3xl ring-4 ring-background shrink-0"
                        />
                        <div className="flex-1 min-w-0 pt-2">
                            <h1 className="text-2xl font-bold leading-tight">
                                {author.name}
                            </h1>
                            {author.professionalRole && (
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    {author.professionalRole}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <span>
                                    {author.followersCount} abonné
                                    {author.followersCount > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <FollowButton
                                authorId={author.id}
                                initialCount={author.followersCount}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts grid */}
            <section>
                <h2 className="text-lg font-bold mb-6">Publications</h2>
                {author.posts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Aucune publication pour l'instant.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {author.posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                href={postUrl(post)}
                                variant="vertical"
                            />
                        ))}
                    </div>
                )}
            </section>
        </MainLayout>
    );
}
