import Link from 'next/link';
import Image from 'next/image';
import { serverApi } from '@/lib/api/server';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { FollowButton } from '@/components/molecules/follow-button';
import { NewsletterForm } from '@/components/molecules/newsletter-form';
import { postUrl } from '@/lib/post-url';
import { extractExcerpt } from '@/lib/utils';
import type { Post } from '@/lib/api/types';

interface CmsTag {
    name: string;
    count: number;
}

interface CmsAuthor {
    id: string;
    name: string;
    avatarPath: string | null;
    professionalRole: string | null;
    postCount: number;
}

/* ── Section heading ─────────────────────────────────────────────────────── */

function SidebarHeading({ label }: { label: string }) {
    return (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
            {label}
        </p>
    );
}

/* ── BlogSidebar ─────────────────────────────────────────────────────────── */

export async function BlogSidebar() {
    const [authorsResult, tagsResult, postsResult] = await Promise.allSettled([
        serverApi.get<{ items: CmsAuthor[] }>('/cms/authors'),
        serverApi.get<{ items: CmsTag[] }>('/cms/tags'),
        serverApi.get<{ items: Post[] }>('/cms/posts?limit=4'),
    ]);

    const authors: CmsAuthor[] =
        authorsResult.status === 'fulfilled'
            ? authorsResult.value.items.slice(0, 5)
            : [];

    const tags: CmsTag[] =
        tagsResult.status === 'fulfilled'
            ? tagsResult.value.items.slice(0, 12)
            : [];

    const trendingPosts: Post[] =
        postsResult.status === 'fulfilled'
            ? postsResult.value.items.slice(0, 4)
            : [];

    return (
        <aside className="flex flex-col gap-8 pt-1">

            {/* ── Top Writers ──────────────────────────────────────────── */}
            {authors.length > 0 && (
                <section>
                    <SidebarHeading label="Auteurs populaires" />
                    <div className="flex flex-col gap-4">
                        {authors.map((author) => (
                            <div key={author.id} className="flex items-center gap-3">
                                <Link href={`/authors/${author.id}`} className="shrink-0">
                                    <UserAvatar
                                        name={author.name}
                                        avatarPath={author.avatarPath}
                                        size="md"
                                        className="h-9 w-9 text-[13px]"
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/authors/${author.id}`}
                                        className="text-[13px] font-medium leading-tight hover:text-primary transition-colors truncate block"
                                    >
                                        {author.name}
                                    </Link>
                                    {author.professionalRole && (
                                        <p className="text-[11px] text-muted-foreground/60 truncate">
                                            {author.professionalRole}
                                        </p>
                                    )}
                                </div>
                                <FollowButton
                                    authorId={author.id}
                                    className="h-7 text-[11px] px-2.5 shrink-0"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Divider ──────────────────────────────────────────────── */}
            {authors.length > 0 && tags.length > 0 && (
                <div className="h-px bg-border/50" />
            )}

            {/* ── Recommended Topics ───────────────────────────────────── */}
            {tags.length > 0 && (
                <section>
                    <SidebarHeading label="Sujets recommandés" />
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Link
                                key={tag.name}
                                href={`/publications?tag=${encodeURIComponent(tag.name)}`}
                                className="inline-flex items-center px-3 py-1 rounded-full text-[12px] bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150"
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Divider ──────────────────────────────────────────────── */}
            {trendingPosts.length > 0 && (
                <div className="h-px bg-border/50" />
            )}

            {/* ── Trending ─────────────────────────────────────────────── */}
            {trendingPosts.length > 0 && (
                <section>
                    <SidebarHeading label="En ce moment" />
                    <div className="flex flex-col gap-4">
                        {trendingPosts.map((post, i) => {
                            const owner = post.contributors.find((c) => c.owner);
                            const excerpt = extractExcerpt(post.content, 80);
                            return (
                                <Link
                                    key={post.id}
                                    href={postUrl(post)}
                                    className="group flex gap-3"
                                >
                                    {/* Rank */}
                                    <span className="text-[20px] font-bold text-muted-foreground/15 leading-none pt-0.5 w-5 shrink-0 select-none">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        {owner && (
                                            <p className="text-[11px] text-muted-foreground/50 mb-0.5 truncate">
                                                {owner.user.name}
                                            </p>
                                        )}
                                        <p className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                            {post.title || 'Sans titre'}
                                        </p>
                                        {excerpt && (
                                            <p className="text-[11px] text-muted-foreground/60 line-clamp-2 mt-0.5 leading-relaxed">
                                                {excerpt}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground/40 mt-1">
                                            {post.readingTime > 0
                                                ? `${post.readingTime} min`
                                                : ''}
                                        </p>
                                    </div>
                                    {post.imagePath && (
                                        <div className="shrink-0 relative w-14 h-14 rounded-lg overflow-hidden bg-muted">
                                            <Image
                                                src={post.imagePath}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Divider ──────────────────────────────────────────────── */}
            <div className="h-px bg-border/50" />

            {/* ── Newsletter ───────────────────────────────────────────── */}
            <section>
                <SidebarHeading label="Newsletter" />
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
                    Recevez les meilleurs articles directement dans votre boîte mail.
                </p>
                <NewsletterForm />
            </section>

        </aside>
    );
}
