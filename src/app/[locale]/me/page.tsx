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
            <div className="max-w-4xl mx-auto">
                {/* ── Cover ──────────────────────────────────────────── */}
                <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-muted">
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

                {/* ── Identity header ─────────────────────────────────── */}
                <div className="px-2 sm:px-6 -mt-12 mb-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                        <UserAvatar
                            name={me.name}
                            avatarPath={me.avatarPath}
                            size="xl"
                            className="h-24 w-24 text-2xl ring-4 ring-background shrink-0"
                        />

                        <div className="flex-1 min-w-0 sm:pb-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.1] text-foreground">
                                    {me.name}
                                </h1>
                                {me.role === 'ADMIN' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-foreground/60 border border-border">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <p className="text-[13px] text-muted-foreground flex items-center gap-1 leading-tight">
                                <AtSign className="h-3.5 w-3.5" />
                                <Link
                                    href={`/@${handle}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {handle}
                                </Link>
                                <span className="text-muted-foreground/40 mx-1.5">
                                    ·
                                </span>
                                <span className="truncate">{me.email}</span>
                            </p>

                            {me.professionalRole && (
                                <p className="text-[14px] text-foreground/70 mt-2">
                                    {me.professionalRole}
                                </p>
                            )}

                            {me.bio && (
                                <p className="text-[14px] leading-relaxed text-foreground/65 mt-2 max-w-2xl">
                                    {me.bio}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 sm:pb-1">
                            <MeActions isAdmin={me.role === 'ADMIN'} />
                            <Link
                                href="/me/profile"
                                className="h-9 px-3 rounded-lg text-[12px] font-medium border border-border text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    Modifier
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Socials */}
                    {hasSocials && (
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 ml-0 sm:ml-[7.5rem] text-muted-foreground">
                            {me.location && (
                                <span className="flex items-center gap-1.5 text-[12px]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {me.location}
                                </span>
                            )}
                            {me.website && (
                                <a
                                    href={me.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[12px] hover:text-foreground transition-colors"
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
                                    className="flex items-center gap-1.5 text-[12px] hover:text-foreground transition-colors"
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
                                    className="flex items-center gap-1.5 text-[12px] hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                    {me.githubHandle}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Inline stats row ────────────────────────────────── */}
                <div className="flex items-center gap-8 px-2 sm:px-6 py-4 border-y border-border mb-10">
                    <InlineStat value={publishedTotal} label="publications" />
                    <span className="h-4 w-px bg-border" />
                    <InlineStat value={draftTotal} label="brouillons" />
                    <span className="h-4 w-px bg-border" />
                    <InlineStat
                        value={`@${handle}`}
                        label="identifiant"
                        small
                    />
                </div>

                {/* ── Tabs ────────────────────────────────────────────── */}
                <Tabs defaultValue="published" className="px-2 sm:px-6">
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

/* ── Inline stat (no card, no color) ─────────────────────────────────────── */

function InlineStat({
    value,
    label,
    small,
}: {
    value: number | string;
    label: string;
    small?: boolean;
}) {
    return (
        <div className="flex items-baseline gap-2">
            <span
                className={
                    small
                        ? 'text-[14px] font-semibold text-foreground tabular-nums truncate max-w-[180px]'
                        : 'text-[20px] font-bold text-foreground tabular-nums'
                }
            >
                {value}
            </span>
            <span className="text-[12px] text-muted-foreground">{label}</span>
        </div>
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
