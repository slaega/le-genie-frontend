import { api } from '../client';

export const onlineApi = {
    ping(fingerprint: string) {
        return api.post<{ count: number }>('/online/ping', { fingerprint });
    },
    count() {
        return api.get<{ count: number }>('/online/count');
    },
};
