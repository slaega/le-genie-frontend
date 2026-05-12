import { api } from '../client';
import type { Post, PaginatedResponse } from '../types';

const base = '/cms';

export const cmsApi = {
    /** Public list — only PUBLISHED posts */
    list(params?: {
        page?: number;
        limit?: number;
        sort?: string;
        tags?: string[];
    }) {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.sort) qs.set('sort', params.sort);
        if (params?.tags?.length)
            params.tags.forEach((t) => qs.append('tags', t));
        const query = qs.toString();
        return api.get<PaginatedResponse<Post>>(
            `${base}/posts${query ? `?${query}` : ''}`
        );
    },

    get(id: string) {
        return api.get<Post>(`${base}/posts/${id}`);
    },

    related(id: string) {
        return api.get<{ items: Post[] }>(`${base}/posts/${id}/related`);
    },

    /**
     * Full-text search on published posts.
     * Backed by case-insensitive LIKE on title, content and tags — works on
     * Postgres, MySQL and SQLite without extra infra.
     */
    search(q: string, params?: { page?: number; limit?: number }) {
        const qs = new URLSearchParams({ q });
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        return api.get<PaginatedResponse<Post>>(
            `${base}/posts/search?${qs.toString()}`
        );
    },
};
