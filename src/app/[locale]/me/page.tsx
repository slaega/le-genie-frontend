import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/api/server';
import type { User, PaginatedResponse, Post } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { MainLayout } from '@/components/templates/main-layout';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { PostsGrid } from '@/components/organisms/posts-grid';
import { ProfileEditDialog } from '@/components/organisms/profile-edit-dialog';
import { FollowingList } from '@/components/organisms/following-list';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { postKeys } from '@/hooks/queries/use-posts';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Page protégée — rendu serveur à la demande (cookies requis, pas de prerender).
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export const metadata = { title: 'Mon profil — Le Génie' };

export default async function ProfilePage({ params }: Props) {
    const { locale } = await params;
    let me: User;

    try {
        me = await serverApi.get<User>('auth/me');
    } catch (err) {
        if (err instanceof ApiError) redirect(`/${locale}/auth/sign-in`);
        throw err;
    }

    const qc = new QueryClient();
    // Précharge les deux tabs en parallèle côté serveur
    await Promise.all([
        qc.prefetchQuery({
            queryKey: postKeys.list({
                status: 'PUBLISHED',
                limit: 12,
                me: true,
            }),
            queryFn: () =>
                serverApi.get<PaginatedResponse<Post>>(
                    'posts?status=PUBLISHED&limit=12&me=true'
                ),
        }),
        qc.prefetchQuery({
            queryKey: postKeys.list({ status: 'DRAFT', limit: 12, me: true }),
            queryFn: () =>
                serverApi.get<PaginatedResponse<Post>>(
                    'posts?status=DRAFT&limit=12&me=true'
                ),
        }),
    ]);

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <UserAvatar
                        name={me.name}
                        avatarPath={me.avatarPath}
                        size="lg"
                        className="h-20 w-20 text-2xl"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">{me.name}</h1>
                            <ProfileEditDialog user={me} />
                        </div>
                        <p className="text-muted-foreground">{me.email}</p>
                        {me.professionalRole && (
                            <Badge variant="secondary" className="mt-2">
                                {me.professionalRole}
                            </Badge>
                        )}
                    </div>
                </div>

                <Separator />

                <Tabs defaultValue="published">
                    <TabsList>
                        <TabsTrigger value="published">
                            Publications
                        </TabsTrigger>
                        <TabsTrigger value="drafts">Brouillons</TabsTrigger>
                        <TabsTrigger value="following">Abonnements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="published" className="mt-6">
                        <HydrationBoundary state={dehydrate(qc)}>
                            <PostsGrid
                                params={{
                                    status: 'PUBLISHED',
                                    limit: 12,
                                    me: true,
                                }}
                                showStatus
                                emptyTitle="Aucune publication"
                                emptyDescription="Vous n'avez pas encore publié d'article."
                            />
                        </HydrationBoundary>
                    </TabsContent>

                    <TabsContent value="drafts" className="mt-6">
                        <HydrationBoundary state={dehydrate(qc)}>
                            <PostsGrid
                                params={{
                                    status: 'DRAFT',
                                    limit: 12,
                                    me: true,
                                }}
                                showStatus
                                emptyTitle="Aucun brouillon"
                                emptyDescription="Vos brouillons apparaîtront ici."
                            />
                        </HydrationBoundary>
                    </TabsContent>

                    <TabsContent value="following" className="mt-6">
                        <FollowingList />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
