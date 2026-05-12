import { api } from '../client';
import type { User } from '../types';

export const authApi = {
    me() {
        return api.get<User>('/auth/me');
    },
};
