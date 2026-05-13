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
    AtSign,
    ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userHandle } from '@/lib/post-url';

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

    const publishedTotal =
        qc.getQueryData<PaginatedResponse<Post>>(
            postKeys.list({ status: 'PUBLISHED', limit: 12, me: true })
        )?.total ?? 0;

    const draftTotal =
        qc.getQueryData<PaginatedResponse<Post>>(
            postKeys.list({ status: 'DRAFT', limit: 12, me: true })
        )?.total ?? 0;

    const handle = userHandle(me);
    const hasSocials =
        me.location || me.website || me.twitterHandle || me.githubHandle;

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto">
                {/* ── Cover ─────────────────────────────────────────────── */}
                <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                    {me.coverPath && (
                        <Image
                            src={me.coverPath}
                            alt=""
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                {/* ── Identity — stacked vertically ─────────────────────── */}
                <section className="px-1 sm:px-2 -mt-14 mb-12">
                    <UserAvatar
                        name={me.name}
                        avatarPath={me.avatarPath}
                        size="xl"
                        className="h-28 w-28 text-3xl ring-4 ring-background"
                    />

                    {/* Name + handle */}
                    <div className="mt-5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.1] text-foreground">
                                {me.name}
                            </h1>
                            {me.role === 'ADMIN' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-foreground/60 border border-border">
                                    Admin
                                </span>
                            )}
                        </div>

                        <p className="text-[13px] text-muted-foreground flex items-center gap-1 mt-2 leading-tight">
                            <AtSign className="h-3.5 w-3.5 text-primary" />
                            <Link
                                href={`/@${handle}`}
                                className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                            >
                                {handle}
                            </Link>
                            <span className="text-muted-foreground/40 mx-1.5">
                                ·
                            </span>
                            <span className="truncate">{me.email}</span>
                        </p>

                        {me.professionalRole && (
                            <p className="text-[15px] text-foreground/80 mt-3">
                                {me.professionalRole}
                            </p>
                        )}

                        {me.bio && (
                            <p className="text-[15px] leading-[1.6] text-foreground/70 mt-3 max-w-2xl">
                                {me.bio}
                            </p>
                        )}
                    </div>

                    {/* Action row — full-row below identity, like Medium/Twitter */}
                    <div className="flex items-center gap-2 mt-6">
                        <MeActions isAdmin={me.role === 'ADMIN'} />
                        <Link
                            href="/me/profile"
                            className="h-9 px-3.5 rounded-lg text-[13px] font-medium border border-border text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
                        >
                            <Settings className="h-3.5 w-3.5" />
                            Modifier le profil
                        </Link>
                    </div>

                    {/* Socials */}
                    {hasSocials && (
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-muted-foreground">
                            {me.location && (
                                <span className="flex items-center gap-1.5 text-[13px]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {me.location}
                                </span>
                            )}
                            {me.website && (
                                <a
                                    href={me.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    {me.website.replace(/^https?:\/\//, '')}
                                    <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                                </a>
                            )}
                            {me.twitterHandle && (
                                <a
                                    href={`https://twitter.com/${me.twitterHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Twitter className="h-3.5 w-3.5" />@
                                    {me.twitterHandle}
                                </a>
                            )}
                            {me.githubHandle && (
                                <a
                                    href={`https://github.com/${me.githubHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                    {me.githubHandle}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Inline stats — Twitter/Medium style */}
                    <div className="flex items-center gap-5 mt-6 text-[14px]">
                        <span className="text-foreground">
                            <strong className="font-bold tabular-nums">
                                {publishedTotal}
                            </strong>
                            <span className="text-muted-foreground ml-1.5">
                                {publishedTotal === 1
                                    ? 'publication'
                                    : 'publications'}
                            </span>
                        </span>
                        <span className="text-foreground">
                            <strong className="font-bold tabular-nums">
                                {draftTotal}
                            </strong>
                            <span className="text-muted-foreground ml-1.5">
                                {draftTotal === 1 ? 'brouillon' : 'brouillons'}
                            </span>
                        </span>
                    </div>
                </section>

                {/* ── Tabs — underline only, full-width baseline ────────── */}
                <Tabs defaultValue="published">
                    <TabsList className="mb-8 bg-transparent p-0 h-auto border-b border-border rounded-none w-full justify-start gap-7">
                        <TabTriggerStyled
                            value="published"
                            label="Publications"
                            count={publishedTotal}
                        />
                        <TabTriggerStyled
                            value="drafts"
                            label="Brouillons"
                            count={draftTotal}
                        />
                        <TabTriggerStyled
                            value="following"
                            label="Abonnements"
                        />
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

/* ── Tab trigger — underline only, no color ──────────────────────────────── */

function TabTriggerStyled({
    value,
    label,
    count,
}: {
    value: string;
    label: string;
    count?: number;
}) {
    return (
        <TabsTrigger
            value={value}
            className="relative h-10 px-0 rounded-none bg-transparent border-0 shadow-none text-[13px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-foreground after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:origin-left"
        >
            {label}
            {typeof count === 'number' && count > 0 && (
                <span className="ml-1.5 text-[10px] tabular-nums text-muted-foreground/60">
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}
