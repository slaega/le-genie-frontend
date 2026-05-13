/**
 * Public author profile — served at /@:username via next.config.ts rewrite.
 *
 * Backend lookup chain:
 *   1. /cms/users/by-username/:username    (preferred — cheap direct lookup)
 *   2. /cms/authors        + handle match  (fallback while backend catches up)
 *
 * The username param is the user-facing handle; we resolve it to an internal
 * author ID before fetching the full profile + posts.
 */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
    AtSign,
    Globe,
    Twitter,
    Github,
    MapPin,
    ExternalLink,
    BookOpen,
} from 'lucide-react';
import { serverApi } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { Post } from '@/lib/api/types';
import { MainLayout } from '@/components/templates/main-layout';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { PostCard } from '@/components/molecules/post-card';
import { FollowButton } from '@/components/molecules/follow-button';
import { postUrl, userHandle } from '@/lib/post-url';

/* ── Types ───────────────────────────────────────────────────────────────── */

interface AuthorProfile {
    id: string;
    name: string;
    username?: string | null;
    email?: string;
    avatarPath: string | null;
    coverPath: string | null;
    professionalRole: string | null;
    bio?: string | null;
    about?: string | null;
    location?: string | null;
    website?: string | null;
    twitterHandle?: string | null;
    githubHandle?: string | null;
    followersCount: number;
    posts: Post[];
}

interface AuthorListItem {
    id: string;
    name: string;
    username?: string | null;
    email?: string;
    avatarPath: string | null;
    professionalRole: string | null;
    postCount: number;
}

type Props = { params: Promise<{ locale: string; username: string }> };

/* ── Lookup helper ───────────────────────────────────────────────────────── */

async function findAuthorByHandle(
    handle: string
): Promise<AuthorProfile | null> {
    // 1. Direct lookup if backend supports it.
    try {
        return await serverApi.get<AuthorProfile>(
            `cms/users/by-username/${encodeURIComponent(handle)}`
        );
    } catch {
        // ignore and try fallback
    }

    // 2. Fallback: scan the authors list and resolve by derived handle.
    try {
        const { items } = await serverApi.get<{ items: AuthorListItem[] }>(
            'cms/authors'
        );
        const match = items.find((a) => userHandle(a) === handle);
        if (!match) return null;
        return await serverApi.get<AuthorProfile>(`cms/authors/${match.id}`);
    } catch {
        return null;
    }
}

/* ── Metadata ────────────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const author = await findAuthorByHandle(username);
    if (!author) return { title: 'Auteur — Le Génie' };
    return {
        title: `${author.name} (@${userHandle(author)}) — Le Génie`,
        description:
            author.bio ??
            author.professionalRole ??
            `Articles de ${author.name}`,
        openGraph: {
            title: author.name,
            description: author.bio ?? author.professionalRole ?? undefined,
            images: author.avatarPath ? [author.avatarPath] : [],
        },
    };
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function PublicProfilePage({ params }: Props) {
    const { username } = await params;

    let author: AuthorProfile | null;
    try {
        author = await findAuthorByHandle(username);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }
    if (!author) notFound();

    const handle = userHandle(author);
    const hasSocials =
        author.location ||
        author.website ||
        author.twitterHandle ||
        author.githubHandle;
    const publishedCount = author.posts.length;

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto">
                {/* ── Cover ───────────────────────────────────────────── */}
                <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                    {author.coverPath && (
                        <Image
                            src={author.coverPath}
                            alt=""
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                {/* ── Identity ────────────────────────────────────────── */}
                <section className="px-1 sm:px-2 -mt-14 mb-12">
                    <UserAvatar
                        name={author.name}
                        avatarPath={author.avatarPath}
                        size="xl"
                        className="h-28 w-28 text-3xl ring-4 ring-background"
                    />

                    <div className="mt-5">
                        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.1] text-foreground">
                            {author.name}
                        </h1>

                        <p className="text-[13px] text-muted-foreground flex items-center gap-1 mt-2 leading-tight">
                            <AtSign className="h-3.5 w-3.5 text-primary" />
                            <span className="text-primary font-medium">
                                {handle}
                            </span>
                        </p>

                        {author.professionalRole && (
                            <p className="text-[15px] text-foreground/80 mt-3">
                                {author.professionalRole}
                            </p>
                        )}

                        {(author.bio || author.about) && (
                            <p className="text-[15px] leading-[1.7] text-foreground/70 mt-3 max-w-2xl whitespace-pre-line">
                                {author.bio ?? author.about}
                            </p>
                        )}
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 mt-6">
                        <FollowButton
                            authorId={author.id}
                            initialCount={author.followersCount}
                        />
                    </div>

                    {/* Socials + location */}
                    {hasSocials && (
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-muted-foreground">
                            {author.location && (
                                <span className="flex items-center gap-1.5 text-[13px]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {author.location}
                                </span>
                            )}
                            {author.website && (
                                <a
                                    href={author.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    {author.website.replace(/^https?:\/\//, '')}
                                    <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                                </a>
                            )}
                            {author.twitterHandle && (
                                <a
                                    href={`https://twitter.com/${author.twitterHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Twitter className="h-3.5 w-3.5" />@
                                    {author.twitterHandle}
                                </a>
                            )}
                            {author.githubHandle && (
                                <a
                                    href={`https://github.com/${author.githubHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[13px] hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                    {author.githubHandle}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Inline stats — Twitter / Medium signature */}
                    <div className="flex items-center gap-5 mt-6 text-[14px]">
                        <span className="text-foreground">
                            <strong className="font-bold tabular-nums">
                                {publishedCount}
                            </strong>
                            <span className="text-muted-foreground ml-1.5">
                                {publishedCount === 1
                                    ? 'publication'
                                    : 'publications'}
                            </span>
                        </span>
                        <span className="text-foreground">
                            <strong className="font-bold tabular-nums">
                                {author.followersCount}
                            </strong>
                            <span className="text-muted-foreground ml-1.5">
                                {author.followersCount === 1
                                    ? 'abonné'
                                    : 'abonnés'}
                            </span>
                        </span>
                    </div>
                </section>

                {/* ── Articles ────────────────────────────────────────── */}
                <section>
                    <div className="flex items-baseline justify-between gap-4 mb-6 pb-4 border-b border-border">
                        <h2 className="text-[20px] font-bold tracking-tight">
                            Publications
                        </h2>
                        <p className="text-[12px] text-muted-foreground">
                            {publishedCount} article
                            {publishedCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {author.posts.length === 0 ? (
                        <div className="text-center py-20 surface">
                            <BookOpen className="h-6 w-6 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-[14px] text-foreground/70 font-medium">
                                Aucune publication pour l&apos;instant.
                            </p>
                            <p className="text-[12.5px] text-muted-foreground mt-1">
                                Revenez bientôt — {author.name.split(' ')[0]}{' '}
                                écrit peut-être déjà sa prochaine publication.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                {/* ── Footer link to publications ─────────────────────── */}
                <div className="text-center mt-14">
                    <Link
                        href="/publications"
                        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-primary transition-colors"
                    >
                        Découvrir d&apos;autres auteurs
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
