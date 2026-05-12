'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikeStats } from '@/hooks/queries/use-like-stats';
import { useToggleLike } from '@/hooks/mutations/use-toggle-like';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
    postId: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
    postId,
    className,
    size = 'md',
}: LikeButtonProps) {
    const { data, isLoading } = useLikeStats(postId);
    const { mutate: toggle, isPending } = useToggleLike(postId);

    const liked = data?.liked ?? false;
    const count = data?.count ?? 0;

    const sizeMap = {
        sm: { btn: 'h-8 px-3 text-xs gap-1.5', icon: 'h-3.5 w-3.5' },
        md: { btn: 'h-10 px-4 text-sm gap-2', icon: 'h-4 w-4' },
        lg: { btn: 'h-12 px-5 text-base gap-2', icon: 'h-5 w-5' },
    }[size];

    return (
        <Button
            variant="outline"
            onClick={() => toggle()}
            disabled={isPending || isLoading}
            aria-pressed={liked}
            aria-label={liked ? 'Retirer mon like' : 'Aimer cet article'}
            className={cn(
                sizeMap.btn,
                'rounded-full transition-colors',
                liked &&
                    'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/60',
                className
            )}
        >
            <Heart
                className={cn(
                    sizeMap.icon,
                    'transition-transform',
                    liked && 'fill-current scale-110'
                )}
            />
            <span className="tabular-nums">{count}</span>
        </Button>
    );
}
