import { api } from '../client';
import type {
    Post,
    PaginatedResponse,
    UpdatePostPayload,
    PostsQueryParams,
} from '../types';

const base = '/posts';

export const postsApi = {
    list(params?: PostsQueryParams) {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.status) qs.set('status', params.status);
        if (params?.tags?.length)
            params.tags.forEach((t) => qs.append('tags', t));
        if (params?.me) qs.set('me', 'true');
        const query = qs.toString();
        return api.get<PaginatedResponse<Post>>(
            `${base}${query ? `?${query}` : ''}`
        );
    },

    get(id: string) {
        return api.get<Post>(`${base}/${id}`);
    },

    create() {
        return api.post<Post>(base);
    },

    update(id: string, payload: UpdatePostPayload) {
        return api.patch<Post>(`${base}/${id}`, payload);
    },

    updateWithCover(id: string, payload: UpdatePostPayload, cover?: File) {
        const form = new FormData();
        if (payload.title !== undefined) form.append('title', payload.title);
        if (payload.content !== undefined)
            form.append('content', JSON.stringify(payload.content));
        if (payload.status !== undefined) form.append('status', payload.status);
        if (payload.scheduledAt !== undefined)
            form.append('scheduledAt', payload.scheduledAt ?? '');
        if (cover) form.append('imageFile', cover);
        return api.patch<Post>(`${base}/${id}`, form);
    },

    delete(id: string) {
        return api.delete<void>(`${base}/${id}`);
    },

    uploadImage(postId: string, file: File) {
        const form = new FormData();
        form.append('image', file);
        return api.post<{ url: string }>(`${base}/${postId}/images`, form);
    },
};
