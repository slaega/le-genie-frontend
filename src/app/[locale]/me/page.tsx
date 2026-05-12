import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/api/server';
import type { User, PaginatedResponse, Post } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import Link from 'next/link';
import Image from 'next/image';
import {
    Settings,
    Globe,
    Twitter,
    Github,
    MapPin,
    BookOpen,
    FileText,
} from 'lucide-react';
import { MainLayout } from '@/components/templates/main-layout';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { PostsGrid } from '@/components/organisms/posts-grid';
import { FollowingList } from '@/components/organisms/following-list';
import { MeActions } from '@/components/organisms/me-actions';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { postKeys } from '@/hooks/queries/use-posts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Page protégée — rendu serveur à la demande (cookies requis, pas de prerender).
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export const metadata = { title: 'Mon espace — Le Génie' };

export default async function MePage({ params }: Props) {
    const { locale } = await params;
    let me: User;

    try {
        me = await serverApi.get<User>('auth/me');
    } catch (err) {
        if (err instanceof ApiError) redirect(`/${locale}/auth/sign-in`);
        throw err;
    }

    const qc = new QueryClient();

    await Promise.all([
        qc.prefetchQuery({
            queryKey: postKeys.list({ status: 'PUBLISHED', limit: 12, me: true }),
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

    const publishedTotal =
        qc.getQueryData<PaginatedResponse<Post>>(
            postKeys.list({ status: 'PUBLISHED', limit: 12, me: true })
        )?.total ?? 0;

    const draftTotal =
        qc.getQueryData<PaginatedResponse<Post>>(
            postKeys.list({ status: 'DRAFT', limit: 12, me: true })
        )?.total ?? 0;

    const hasSocials =
        me.location || me.website || me.twitterHandle || me.githubHandle;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">

                {/* ── Cover photo ─────────────────────────────────────── */}
                <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-muted/60">
                    {me.coverPath && (
                        <Image
                            src={me.coverPath}
                            alt="Photo de couverture"
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                {/* ── Avatar + actions row ─────────────────────────────── */}
                <div className="flex items-end justify-between px-4 sm:px-6 -mt-12 mb-4">
                    {/* Avatar overlapping the cover */}
                    <div className="ring-4 ring-background rounded-full shrink-0">
                        <UserAvatar
                            name={me.name}
                            avatarPath={me.avatarPath}
                            size="lg"
                            className="h-24 w-24 text-3xl"
                        />
                    </div>

                    {/* Action buttons (client — Écrire, Admin, Déconnecter) */}
                    <div className="flex items-center gap-2 mb-1">
                        <MeActions isAdmin={me.role === 'ADMIN'} />
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                        >
                            <Link href="/me/profile">
                                <Settings className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    Modifier le profil
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── Profile info ────────────────────────────────────── */}
                <div className="px-4 sm:px-6 space-y-2 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">{me.name}</h1>
                        {me.role === 'ADMIN' && (
                            <Badge variant="destructive" className="text-xs">
                                Admin
                            </Badge>
                        )}
                    </div>

                    {me.professionalRole && (
                        <p className="text-sm font-medium text-muted-foreground">
                            {me.professionalRole}
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground">{me.email}</p>

                    {me.bio && (
                        <p className="text-sm leading-relaxed max-w-2xl">
                            {me.bio}
                        </p>
                    )}

                    {/* Socials & location */}
                    {hasSocials && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                            {me.location && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    {me.location}
                                </span>
                            )}
                            {me.website && (
                                <a
                                    href={me.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Globe className="h-3.5 w-3.5 shrink-0" />
                                    {me.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            {me.twitterHandle && (
                                <a
                                    href={`https://twitter.com/${me.twitterHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Twitter className="h-3.5 w-3.5 shrink-0" />
                                    @{me.twitterHandle}
                                </a>
                            )}
                            {me.githubHandle && (
                                <a
                                    href={`https://github.com/${me.githubHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3.5 w-3.5 shrink-0" />
                                    {me.githubHandle}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Stats row ───────────────────────────────────────── */}
                <div className="flex items-center gap-6 px-4 sm:px-6 py-4 border-y border-border mb-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                            <strong className="font-semibold text-foreground">
                                {publishedTotal}
                            </strong>{' '}
                            <span className="text-muted-foreground">
                                publication{publishedTotal > 1 ? 's' : ''}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                            <strong className="font-semibold text-foreground">
                                {draftTotal}
                            </strong>{' '}
                            <span className="text-muted-foreground">
                                brouillon{draftTotal > 1 ? 's' : ''}
                            </span>
                        </span>
                    </div>
                </div>

                {/* ── Tabs ────────────────────────────────────────────── */}
                <Tabs defaultValue="published" className="px-4 sm:px-6">
                    <TabsList className="mb-6">
                        <TabsTrigger value="published">
                            Publications
                            {publishedTotal > 0 && (
                                <span className="ml-1.5 text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                                    {publishedTotal}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="drafts">
                            Brouillons
                            {draftTotal > 0 && (
                                <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                                    {draftTotal}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="following">
                            Abonnements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="published">
                        <HydrationBoundary state={dehydrate(qc)}>
                            <PostsGrid
                                params={{
                                    status: 'PUBLISHED',
                                    limit: 12,
                                    me: true,
                                }}
                                showStatus
                                showActions
                                emptyTitle="Aucune publication"
                                emptyDescription="Votre première publication apparaîtra ici."
                            />
                        </HydrationBoundary>
                    </TabsContent>

                    <TabsContent value="drafts">
                        <HydrationBoundary state={dehydrate(qc)}>
                            <PostsGrid
                                params={{
                                    status: 'DRAFT',
                                    limit: 12,
                                    me: true,
                                }}
                                showStatus
                                showActions
                                emptyTitle="Aucun brouillon"
                                emptyDescription="Vos brouillons en cours apparaîtront ici."
                            />
                        </HydrationBoundary>
                    </TabsContent>

                    <TabsContent value="following">
                        <FollowingList />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
