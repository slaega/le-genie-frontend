'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    authorId: string;
    initialFollowing?: boolean;
    initialCount?: number;
    className?: string;
}

interface FollowStatus {
    following: boolean;
    followersCount: number;
}

export function FollowButton({
    authorId,
    initialFollowing = false,
    initialCount = 0,
    className,
}: FollowButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [following, setFollowing] = useState(initialFollowing);
    const [count, setCount] = useState(initialCount);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        api.get<FollowStatus>(`/users/${authorId}/follow/status`)
            .then((data) => {
                setFollowing(data.following);
                setCount(data.followersCount);
            })
            .catch(() => {
                // leave initial values on error
            });
    }, [authorId]);

    // Hide button if the viewer is the author
    if (user?.id === authorId) return null;

    async function handleToggle() {
        if (isPending) return;

        // Optimistic update
        const prevFollowing = following;
        const prevCount = count;
        setFollowing(!prevFollowing);
        setCount(prevFollowing ? count - 1 : count + 1);
        setIsPending(true);

        try {
            if (prevFollowing) {
                await api.delete(`/users/${authorId}/follow`);
            } else {
                await api.post(`/users/${authorId}/follow`);
            }
        } catch (err) {
            // Rollback
            setFollowing(prevFollowing);
            setCount(prevCount);

            if (err instanceof ApiError && err.status === 401) {
                router.push(
                    `/auth/sign-in?redirect=${encodeURIComponent(pathname)}`
                );
            }
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Button
            variant={following ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={following}
            aria-label={following ? 'Se désabonner' : 'Suivre cet auteur'}
            className={cn(
                'gap-2 transition-colors',
                following &&
                    'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white',
                className
            )}
        >
            {following ? (
                <UserCheck className="h-4 w-4" />
            ) : (
                <UserPlus className="h-4 w-4" />
            )}
            <span>
                {count} abonné{count > 1 ? 's' : ''}
            </span>
        </Button>
    );
}
