'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { viewsApi, type ViewCount } from '@/lib/api';
import { getVisitorId } from '@/lib/visitor-id';
import { viewKeys } from '@/hooks/queries/use-view-count';

/**
 * Fire-and-forget hook — tracks a single view per (post, visitor) per page mount.
 * Idempotent server-side, but we also debounce client-side via a ref to avoid
 * double-firing on React strict-mode double-invokes.
 */
export function useTrackView(postId: string) {
    const qc = useQueryClient();
    const sentRef = useRef<string | null>(null);

    useEffect(() => {
        if (!postId || sentRef.current === postId) return;
        sentRef.current = postId;

        viewsApi
            .track(postId, getVisitorId())
            .then((result) => {
                qc.setQueryData<ViewCount>(viewKeys.count(postId), {
                    count: result.count,
                });
            })
            .catch(() => {
                // silently ignore — tracking is best-effort
            });
    }, [postId, qc]);
}
