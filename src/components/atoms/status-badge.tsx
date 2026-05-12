import { Badge } from '@/components/ui/badge';
import type { PostStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<PostStatus, string> = {
    EMPTY: 'Vide',
    DRAFT: 'Brouillon',
    PUBLISHED: 'Publié',
    ARCHIVED: 'Archivé',
};

const STATUS_VARIANTS: Record<PostStatus, string> = {
    EMPTY: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PUBLISHED:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ARCHIVED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface StatusBadgeProps {
    status: PostStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'text-xs font-medium border-0 rounded-full',
                STATUS_VARIANTS[status],
                className
            )}
        >
            {STATUS_LABELS[status]}
        </Badge>
    );
}
