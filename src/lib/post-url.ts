import type { Post, Contributor } from '@/lib/api/types';

/**
 * URL-safe handle from a display name. e.g. "Seba Gedeon" → "seba-gedeon".
 * Used as a fallback when `user.username` is not yet provisioned.
 */
function slugifyName(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // strip diacritics
        .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
        .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

/**
 * Minimum shape needed to derive a handle. `username` and `email` are
 * accepted as optional/nullable so partial author payloads from the API
 * (sidebar lists, follow lists, etc.) work without casting.
 */
export type UserLike = {
    id: string;
    name?: string;
    username?: string | null;
    email?: string | null;
};

/**
 * Resolves a user's public handle, used in URLs as `/@handle`.
 *
 * Precedence:
 *   1. `user.username` — once the backend provisions it.
 *   2. `slugifyName(user.name)` — backward-compat for legacy accounts.
 *   3. Local part of `user.email`.
 *   4. `user.id` — last resort.
 *
 * The result is always lowercase, URL-safe, and unique-by-construction at the
 * top level (`username` is enforced unique by the backend).
 */
export function userHandle(user: UserLike | null | undefined): string {
    if (!user) return '';
    if (user.username) return user.username;
    if (user.name) {
        const slug = slugifyName(user.name);
        if (slug) return slug;
    }
    if (user.email) {
        const local = user.email.split('@')[0]?.toLowerCase();
        if (local) return slugifyName(local) || local;
    }
    return user.id;
}

/** Public profile URL for a user — `/@handle`. */
export function userUrl(user: UserLike): string {
    const handle = userHandle(user);
    return handle ? `/@${handle}` : `/authors/${user.id}`;
}

type PostForUrl = Pick<Post, 'id' | 'slug'> & { contributors?: Contributor[] };

/**
 * Canonical public URL for a post.
 *
 * When the post has a slug and a known owner, the URL follows the Medium-style
 * format: `/@handle/slug` (rewritten internally to `/p/:handle/:slug`).
 * Falls back to `/post/:slug` or `/post/:id` for legacy posts without an owner.
 */
export function postUrl(post: PostForUrl): string {
    if (!post.slug) return `/post/${post.id}`;
    const owner = post.contributors?.find((c) => c.owner)?.user;
    const handle = owner ? userHandle(owner) : null;
    if (handle) return `/@${handle}/${post.slug}`;
    return `/post/${post.slug}`;
}

/**
 * Returns the edit URL for a post.
 * Always uses the /post/:slug/edit pattern (internal, authenticated route).
 */
export function postEditUrl(post: Pick<Post, 'id' | 'slug'>): string {
    return `/post/${post.slug ?? post.id}/edit`;
}
