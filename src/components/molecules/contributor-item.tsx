import { Crown, X } from 'lucide-react';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Contributor } from '@/lib/api/types';

interface ContributorItemProps {
    contributor: Contributor;
    isOwner?: boolean;
    canRemove?: boolean;
    onRemove?: (contributorId: string) => void;
}

export function ContributorItem({
    contributor,
    isOwner,
    canRemove,
    onRemove,
}: ContributorItemProps) {
    return (
        <div className="flex items-center gap-3 py-2">
            <UserAvatar
                name={contributor.user.name}
                avatarPath={contributor.user.avatarPath}
                size="sm"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {contributor.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {contributor.user.email}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {contributor.owner && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="gap-1 text-xs"
                            >
                                <Crown className="h-3 w-3 text-amber-500" />
                                Propriétaire
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            Propriétaire de la publication
                        </TooltipContent>
                    </Tooltip>
                )}
                {canRemove && !contributor.owner && isOwner && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove?.(contributor.id)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">
                            Retirer {contributor.user.name}
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}
