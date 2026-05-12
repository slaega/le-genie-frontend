import type { Post } from '@/lib/api/types';

/**
 * Returns the canonical public URL for a post.
 * Uses the slug when available, falls back to id for legacy posts.
 */
export function postUrl(post: Pick<Post, 'id' | 'slug'>): string {
    return `/post/${post.slug ?? post.id}`;
}

/**
 * Returns the edit URL for a post.
 * Uses the slug when available, falls back to id.
 */
export function postEditUrl(post: Pick<Post, 'id' | 'slug'>): string {
    return `/post/${post.slug ?? post.id}/edit`;
}
