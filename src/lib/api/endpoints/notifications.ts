import { api } from '../client';
import type { NotificationList } from '../types';

const base = '/notifications';

export const notificationsApi = {
    list() {
        return api.get<NotificationList>(base);
    },

    markAllRead() {
        return api.patch<{ success: boolean }>(`${base}/read-all`);
    },

    markRead(id: string) {
        return api.patch<{ success: boolean }>(`${base}/${id}/read`);
    },

    remove(id: string) {
        return api.delete<{ success: boolean }>(`${base}/${id}`);
    },

    removeAll() {
        return api.delete<{ success: boolean }>(base);
    },
};
