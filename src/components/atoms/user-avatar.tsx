import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name: string;
    avatarPath?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const SIZE_CLASSES = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-20 w-20 text-2xl',
};

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * UserAvatar — neutral, monochrome fallback.
 *
 * No chromatic palette per user; the fallback is a single muted surface so
 * avatars never compete with content. When an avatar image is provided it
 * takes over entirely.
 */
export function UserAvatar({
    name,
    avatarPath,
    size = 'md',
    className,
}: UserAvatarProps) {
    return (
        <Avatar className={cn(SIZE_CLASSES[size], className)}>
            {avatarPath && <AvatarImage src={avatarPath} alt={name} />}
            <AvatarFallback className="bg-foreground text-background font-semibold select-none">
                {getInitials(name) || '?'}
            </AvatarFallback>
        </Avatar>
    );
}
