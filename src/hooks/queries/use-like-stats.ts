'use client';

import { useQuery } from '@tanstack/react-query';
import { likesApi, type LikeStats } from '@/lib/api';
import { getVisitorId } from '@/lib/visitor-id';
import { useEffect, useState } from 'react';

export const likeKeys = {
    all: ['likes'] as const,
    stats: (postId: string) => [...likeKeys.all, 'stats', postId] as const,
};

/**
 * Returns the like stats for a post, scoped to the current visitor.
 * The query key intentionally OMITS the fingerprint — the cache is per-post,
 * shared across visitors (the `liked` flag is the only per-visitor bit).
 */
export function useLikeStats(postId: string) {
    // visitor id is only available client-side; defer the first fetch
    // to avoid hydration mismatches
    const [fp, setFp] = useState<string | null>(null);
    useEffect(() => setFp(getVisitorId()), []);

    return useQuery<LikeStats>({
        queryKey: likeKeys.stats(postId),
        queryFn: () => likesApi.stats(postId, fp ?? undefined),
        enabled: !!postId && !!fp,
        staleTime: 30_000,
    });
}
