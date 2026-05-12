import { api } from '../client';
import type {
    AdminStats,
    AdminUser,
    AdminPost,
    AdminSubscriber,
    PaginatedResponse,
    UserRole,
} from '../types';

const base = '/admin';

export const adminApi = {
    stats() {
        return api.get<AdminStats>(`${base}/stats`);
    },

    // Users
    users(params?: { page?: number; limit?: number; search?: string }) {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.search) qs.set('search', params.search);
        const q = qs.toString();
        return api.get<PaginatedResponse<AdminUser>>(
            `${base}/users${q ? `?${q}` : ''}`
        );
    },

    updateUser(id: string, data: { role?: UserRole; suspended?: boolean }) {
        return api.patch<AdminUser>(`${base}/users/${id}`, data);
    },

    // Posts
    posts(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }) {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.status) qs.set('status', params.status);
        if (params?.search) qs.set('search', params.search);
        const q = qs.toString();
        return api.get<PaginatedResponse<AdminPost>>(
            `${base}/posts${q ? `?${q}` : ''}`
        );
    },

    archivePost(id: string) {
        return api.patch<{ id: string; status: string }>(
            `${base}/posts/${id}/archive`
        );
    },

    deletePost(id: string) {
        return api.delete<{ success: boolean }>(`${base}/posts/${id}`);
    },

    // Subscribers
    subscribers(params?: { page?: number; limit?: number }) {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        const q = qs.toString();
        return api.get<PaginatedResponse<AdminSubscriber>>(
            `${base}/subscribers${q ? `?${q}` : ''}`
        );
    },

    deleteSubscriber(id: string) {
        return api.delete<{ success: boolean }>(`${base}/subscribers/${id}`);
    },
};
