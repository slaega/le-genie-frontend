import type { Post, Contributor } from '@/lib/api/types';

/** Converts a display name to a URL-safe handle. e.g. "Seba Gedeon" → "seba-gedeon" */
function slugifyName(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // strip diacritics
        .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → hyphen
        .replace(/^-|-$/g, '');           // trim leading/trailing hyphens
}

type PostForUrl = Pick<Post, 'id' | 'slug'> & { contributors?: Contributor[] };

/**
 * Returns the canonical public URL for a post.
 *
 * When the post has a slug and a known owner, the URL follows the Medium-style
 * format: `/@username/slug` (browser-visible via next.config.ts rewrite).
 *
 * Falls back to `/post/slug` or `/post/id` for legacy posts.
 */
export function postUrl(post: PostForUrl): string {
    if (post.slug) {
        const owner = post.contributors?.find((c) => c.owner);
        const username = owner?.user?.name ? slugifyName(owner.user.name) : null;
        if (username) return `/@${username}/${post.slug}`;
        return `/post/${post.slug}`;
    }
    return `/post/${post.id}`;
}

/**
 * Returns the edit URL for a post.
 * Always uses the /post/:slug/edit pattern (internal, authenticated route).
 */
export function postEditUrl(post: Pick<Post, 'id' | 'slug'>): string {
    return `/post/${post.slug ?? post.id}/edit`;
}
