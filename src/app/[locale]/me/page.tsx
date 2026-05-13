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
                {/* ── Cover banner ────────────────────────────────────── */}
                <div className="relative h-48 sm:h-60 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-sm">
                    {me.coverPath && (
                        <Image
                            src={me.coverPath}
                            alt="Photo de couverture"
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    {/* Subtle bottom gradient for legibility under the avatar */}
                    {!me.coverPath && (
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]"
                        />
                    )}
                </div>

                {/* ── Identity header ─────────────────────────────────── */}
                <div className="px-2 sm:px-6 -mt-14 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
                        <UserAvatar
                            name={me.name}
                            avatarPath={me.avatarPath}
                            size="xl"
                            className="h-28 w-28 text-3xl ring-4 ring-background shadow-lg shrink-0"
                        />

                        <div className="flex-1 min-w-0 sm:pb-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight text-foreground">
                                    {me.name}
                                </h1>
                                {me.role === 'ADMIN' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 leading-tight">
                                <AtSign className="h-3.5 w-3.5" />
                                <Link
                                    href={`/@${handle}`}
                                    className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
                                >
                                    {handle}
                                </Link>
                                <span className="text-muted-foreground/30 mx-1">
                                    ·
                                </span>
                                <span>{me.email}</span>
                            </p>

                            {me.professionalRole && (
                                <p className="text-[14px] font-medium text-foreground/80 mt-1.5">
                                    {me.professionalRole}
                                </p>
                            )}

                            {me.bio && (
                                <p className="text-[14px] leading-relaxed text-foreground/70 mt-2 max-w-2xl">
                                    {me.bio}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 sm:pb-1">
                            <MeActions isAdmin={me.role === 'ADMIN'} />
                            <Link
                                href="/me/profile"
                                className="h-9 px-3 rounded-lg text-[12px] font-medium border border-border text-foreground/80 hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    Modifier le profil
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Socials */}
                    {hasSocials && (
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 ml-0 sm:ml-[8.5rem]">
                            {me.location && (
                                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {me.location}
                                </span>
                            )}
                            {me.website && (
                                <a
                                    href={me.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[12px] text-foreground/70 hover:text-foreground hover:underline underline-offset-4 transition-colors"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    {me.website.replace(/^https?:\/\//, '')}
                                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                </a>
                            )}
                            {me.twitterHandle && (
                                <a
                                    href={`https://twitter.com/${me.twitterHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[12px] text-foreground/70 hover:text-foreground transition-colors"
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
                                    className="flex items-center gap-1.5 text-[12px] text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                    {me.githubHandle}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Stats row ───────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-3 px-2 sm:px-6 mb-8">
                    <StatCard
                        icon={BookOpen}
                        value={publishedTotal}
                        label={
                            publishedTotal === 1
                                ? 'Publication'
                                : 'Publications'
                        }
                        accent="text-emerald-600"
                    />
                    <StatCard
                        icon={FileText}
                        value={draftTotal}
                        label={draftTotal === 1 ? 'Brouillon' : 'Brouillons'}
                        accent="text-amber-600"
                    />
                    <StatCard
                        icon={AtSign}
                        value={`@${handle}`}
                        label="Identifiant public"
                        accent="text-indigo-600"
                        small
                    />
                </div>

                {/* ── Tabs ────────────────────────────────────────────── */}
                <Tabs defaultValue="published" className="px-2 sm:px-6">
                    <TabsList className="mb-6 bg-transparent p-0 h-auto border-b border-border rounded-none w-full justify-start gap-6">
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

/* ── Stat card ───────────────────────────────────────────────────────────── */

function StatCard({
    icon: Icon,
    value,
    label,
    accent,
    small,
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: number | string;
    label: string;
    accent: string;
    small?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-background px-4 py-3.5 hover:border-foreground/20 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-3.5 w-3.5 ${accent}`} />
                <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground">
                    {label}
                </p>
            </div>
            <p
                className={`font-bold text-foreground tabular-nums truncate ${
                    small ? 'text-[15px]' : 'text-[22px]'
                }`}
            >
                {value}
            </p>
        </div>
    );
}

/* ── Tab trigger (underline style) ───────────────────────────────────────── */

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
                <span className="ml-1.5 text-[10px] tabular-nums text-muted-foreground/70">
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}
