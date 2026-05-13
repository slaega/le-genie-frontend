import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Globe, Twitter, Github, Mail, Calendar, Clock } from 'lucide-react';
import { BlogViewer } from '@/components/editor/blog-viewer';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { StatusBadge } from '@/components/atoms/status-badge';
import { CommentsSection } from '@/components/organisms/comments-section';
import { RelatedPosts } from '@/components/organisms/related-posts';
import { LikeButton } from '@/components/molecules/like-button';
import { ViewCounter } from '@/components/molecules/view-counter';
import { FollowButton } from '@/components/molecules/follow-button';
import { userUrl, userHandle } from '@/lib/post-url';
import type { Post } from '@/lib/api/types';

interface PostViewProps {
    post: Post;
}

/* ── Author sidebar card ─────────────────────────────────────────────────── */

function AuthorCard({
    author,
}: {
    author: NonNullable<Post['contributors'][number]>['user'];
}) {
    const profileUrl = userUrl(author);

    return (
        <div className="rounded-2xl border border-border bg-background p-6 text-center">
            <Link href={profileUrl} className="inline-block">
                <UserAvatar
                    name={author.name}
                    avatarPath={author.avatarPath}
                    size="xl"
                    className="h-20 w-20 mx-auto shadow-sm"
                />
            </Link>
            <Link
                href={profileUrl}
                className="block mt-3 font-bold text-[15px] text-foreground hover:text-primary transition-colors"
            >
                {author.name}
            </Link>
            <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                {author.professionalRole ?? 'Auteur · Le Génie'}
            </p>

            {/* Social row */}
            {(author.twitterHandle ||
                author.githubHandle ||
                author.website) && (
                <div className="flex items-center justify-center gap-3 mt-4 text-muted-foreground">
                    {author.twitterHandle && (
                        <a
                            href={`https://twitter.com/${author.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                            aria-label={`Twitter de ${author.name}`}
                        >
                            <Twitter className="h-3.5 w-3.5" />
                        </a>
                    )}
                    {author.githubHandle && (
                        <a
                            href={`https://github.com/${author.githubHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                            aria-label={`GitHub de ${author.name}`}
                        >
                            <Github className="h-3.5 w-3.5" />
                        </a>
                    )}
                    {author.website && (
                        <a
                            href={author.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                            aria-label={`Site de ${author.name}`}
                        >
                            <Globe className="h-3.5 w-3.5" />
                        </a>
                    )}
                </div>
            )}

            <div className="mt-5">
                <FollowButton
                    authorId={author.id}
                    className="w-full h-8 text-[12px]"
                />
            </div>
        </div>
    );
}

/* ── Footer card: author + tags/meta ─────────────────────────────────────── */

function PostFooterCard({ post }: { post: Post }) {
    const owner = post.contributors.find((c) => c.owner)?.user;
    if (!owner) return null;
    const profileUrl = userUrl(owner);

    return (
        <div className="rounded-2xl bg-muted/40 border border-border/60 px-6 sm:px-8 py-7 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
            {/* Author column */}
            <div className="flex items-start gap-4 lg:border-r lg:border-border/60 lg:pr-8">
                <Link href={profileUrl} className="shrink-0">
                    <UserAvatar
                        name={owner.name}
                        avatarPath={owner.avatarPath}
                        size="xl"
                        className="h-16 w-16 shadow-sm"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        href={profileUrl}
                        className="font-bold text-[15px] text-foreground hover:text-primary transition-colors block truncate"
                    >
                        {owner.name}
                    </Link>
                    <p className="text-[12px] text-muted-foreground truncate">
                        {owner.professionalRole ?? 'Auteur · Le Génie'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        @{userHandle(owner)}
                    </p>
                    <div className="mt-3">
                        <FollowButton
                            authorId={owner.id}
                            className="h-7 text-[11px] px-3"
                        />
                    </div>
                </div>
            </div>

            {/* Meta + tags */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 mb-1">
                            Email
                        </p>
                        <a
                            href={`mailto:${owner.email}`}
                            className="flex items-center gap-1.5 text-[13px] text-primary hover:underline underline-offset-4 truncate"
                        >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{owner.email}</span>
                        </a>
                    </div>
                    {post.readingTime > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 mb-1">
                                Lecture
                            </p>
                            <p className="flex items-center gap-1.5 text-[13px] text-foreground">
                                <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                                {post.readingTime} min de lecture
                            </p>
                        </div>
                    )}
                </div>

                {post.postTags.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 mb-2">
                            Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {post.postTags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/publications?tag=${encodeURIComponent(tag.name)}`}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-background border border-border text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all"
                                >
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── PostView ────────────────────────────────────────────────────────────── */

export function PostView({ post }: PostViewProps) {
    const owner = post.contributors.find((c) => c.owner)?.user;
    const coAuthors = post.contributors.filter((c) => !c.owner);
    const timeAgo = formatDistanceToNow(new Date(post.updatedAt), {
        addSuffix: true,
        locale: fr,
    });

    const category = post.postTags[0]?.name;

    return (
        <article className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">
            {/* ── Centered title block ───────────────────────────────── */}
            <header className="text-center max-w-3xl mx-auto mb-10 space-y-5">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {post.status !== 'PUBLISHED' && (
                        <StatusBadge status={post.status} />
                    )}
                    {category && (
                        <Link
                            href={`/publications?tag=${encodeURIComponent(category)}`}
                            className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/60 hover:text-foreground transition-colors"
                        >
                            {category}
                        </Link>
                    )}
                </div>

                <h1 className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3rem] font-bold tracking-tight leading-[1.1] text-foreground">
                    {post.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-[12.5px] text-muted-foreground pt-2">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Mis à jour {timeAgo}
                    </span>
                    {post.readingTime > 0 && (
                        <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {post.readingTime} min de lecture
                            </span>
                        </>
                    )}
                </div>
            </header>

            {/* ── Hero image ─────────────────────────────────────────── */}
            {post.imagePath && (
                <div className="relative w-full aspect-[2.4/1] rounded-2xl overflow-hidden mb-14 shadow-sm bg-muted">
                    <Image
                        src={post.imagePath}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        priority
                    />
                </div>
            )}

            {/*
             * Two-column body — article on the LEFT (primary content), author
             * sidebar on the RIGHT. Reading flows naturally; the sidebar is
             * peripheral context, not navigation.
             */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 lg:gap-16">
                {/* Article content (left, primary) */}
                <div className="min-w-0">
                    {/* Engagement bar at the top of the article */}
                    <div className="flex items-center gap-4 mb-8 pb-5 border-b border-border/60">
                        <LikeButton postId={post.id} />
                        <ViewCounter postId={post.id} />
                    </div>

                    <BlogViewer
                        content={post.content}
                        skipTitle
                        className="mb-16"
                    />
                </div>

                {/* Author sidebar (right, sticky) */}
                {owner && (
                    <aside className="lg:sticky lg:top-24 self-start order-first lg:order-last">
                        <AuthorCard author={owner} />

                        {/* Co-authors */}
                        {coAuthors.length > 0 && (
                            <div className="mt-5 rounded-2xl border border-border bg-background p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                                    Co-auteurs
                                </p>
                                <div className="space-y-2.5">
                                    {coAuthors.slice(0, 5).map((c) => (
                                        <Link
                                            key={c.id}
                                            href={userUrl(c.user)}
                                            className="flex items-center gap-2.5 group"
                                        >
                                            <UserAvatar
                                                name={c.user.name}
                                                avatarPath={c.user.avatarPath}
                                                size="sm"
                                            />
                                            <span className="text-[12px] text-foreground/80 group-hover:text-foreground transition-colors truncate">
                                                {c.user.name}
                                            </span>
                                        </Link>
                                    ))}
                                    {coAuthors.length > 5 && (
                                        <p className="text-[11px] text-muted-foreground pl-9">
                                            +{coAuthors.length - 5} de plus
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {/* ── Footer card (tags + author + contact) ──────────────── */}
            <div className="mt-12 mb-16">
                <PostFooterCard post={post} />
            </div>

            {/* ── Related Articles ───────────────────────────────────── */}
            <RelatedPosts postId={post.id} />

            {/* ── Comments ───────────────────────────────────────────── */}
            <div className="mt-16 pt-10 border-t border-border/60">
                <CommentsSection postId={post.id} />
            </div>
        </article>
    );
}
