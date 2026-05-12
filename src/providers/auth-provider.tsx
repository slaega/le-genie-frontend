'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/api/types';

interface AuthContext {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient();
    const { data: user = null, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => authApi.me(),
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    function logout() {
        qc.clear();
        window.location.href = '/auth/sign-in';
    }

    return (
        <AuthCtx.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
            }}
        >
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
