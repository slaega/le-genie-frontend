import type { PostStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<PostStatus, string> = {
    EMPTY: 'Vide',
    DRAFT: 'Brouillon',
    PUBLISHED: 'Publié',
    ARCHIVED: 'Archivé',
};

/** Dot opacity encodes state without leaving the neutral palette. */
const STATUS_DOT: Record<PostStatus, string> = {
    EMPTY: 'bg-muted-foreground/30',
    DRAFT: 'bg-muted-foreground/60',
    PUBLISHED: 'bg-foreground',
    ARCHIVED: 'bg-muted-foreground/40',
};

interface StatusBadgeProps {
    status: PostStatus;
    className?: string;
}

/**
 * Monochrome status pill — a small dot whose opacity encodes state, paired
 * with the label in plain text. No chromatic backgrounds.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-foreground/80 bg-muted/60 border border-border/60',
                status === 'ARCHIVED' &&
                    'line-through decoration-foreground/30',
                className
            )}
        >
            <span
                className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])}
                aria-hidden
            />
            {STATUS_LABELS[status]}
        </span>
    );
}
