import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { meKeys, useMe } from '@/hooks/queries/use-me';
import { ApiError } from '@/lib/api/types';
import type { User } from '@/lib/api/types';

vi.mock('@/lib/api', () => ({
    authApi: { me: vi.fn() },
}));

import { authApi } from '@/lib/api';

const mockUser: User = {
    id: 'u-1',
    email: 'alice@example.com',
    name: 'Alice',
    avatarPath: null,
    coverPath: null,
    professionalRole: null,
    role: 'USER',
    suspended: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
}

beforeEach(() => {
    vi.mocked(authApi.me).mockReset();
});

describe('meKeys', () => {
    it('returns a stable key', () => {
        expect(meKeys.all).toEqual(['me']);
    });
});

describe('useMe', () => {
    it('returns user data on success', async () => {
        vi.mocked(authApi.me).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useMe(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockUser);
    });

    it('does not retry on 401', async () => {
        vi.mocked(authApi.me).mockRejectedValue(
            new ApiError(401, 'Unauthorized')
        );

        const { result } = renderHook(() => useMe(), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));

        // retry: false means authApi.me was called exactly once
        expect(authApi.me).toHaveBeenCalledTimes(1);
    });

    it('staleTime is set to 5 minutes', () => {
        // Verify staleTime via query options — we read the hook's query config
        // The hook configures staleTime: 5 * 60 * 1000 = 300000
        const EXPECTED_STALE_MS = 5 * 60 * 1000;
        vi.mocked(authApi.me).mockResolvedValue(mockUser);

        const client = new QueryClient();
        renderHook(() => useMe(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={client}>
                    {children}
                </QueryClientProvider>
            ),
        });

        const queryState = client
            .getQueryCache()
            .find({ queryKey: meKeys.all });
        // staleTime is set in the hook, not in the QueryClient default — we verify it
        // by checking the query observer options
        expect(queryState?.observers[0]?.options.staleTime).toBe(
            EXPECTED_STALE_MS
        );
    });
});
