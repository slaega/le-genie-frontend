'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, useEffect, useRef, type ReactNode } from 'react';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: (failureCount, error: unknown) => {
                    const status = (error as { status?: number })?.status;
                    if (status === 401 || status === 403 || status === 404)
                        return false;
                    return failureCount < 2;
                },
            },
        },
    });
}

let browserClient: QueryClient | undefined;

function getQueryClient() {
    if (typeof window === 'undefined') return makeQueryClient();
    if (!browserClient) browserClient = makeQueryClient();
    return browserClient;
}

// Devtools are loaded lazily after hydration — no SSR, no hydration mismatch.
function DevtoolsLazy() {
    const [Devtools, setDevtools] = useState<React.ComponentType | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current || process.env.NODE_ENV !== 'development') return;
        loadedRef.current = true;
        import('@tanstack/react-query-devtools').then((m) => {
            setDevtools(() => () => <m.ReactQueryDevtools initialIsOpen={false} />);
        });
    }, []);

    return Devtools ? <Devtools /> : null;
}

export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => getQueryClient());
    return (
        <QueryClientProvider client={client}>
            {children}
            <DevtoolsLazy />
        </QueryClientProvider>
    );
}
