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

/**
 * Eight distinct gradients — deterministic from the user's name so a given
 * person always renders with the same palette across the app. Stronger
 * contrast than the previous `bg-primary/10` placeholder.
 */
const PALETTES = [
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-rose-600',
    'bg-gradient-to-br from-amber-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-sky-500 to-indigo-600',
    'bg-gradient-to-br from-rose-500 to-orange-600',
];

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function paletteFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return PALETTES[Math.abs(hash) % PALETTES.length]!;
}

export function UserAvatar({
    name,
    avatarPath,
    size = 'md',
    className,
}: UserAvatarProps) {
    const palette = paletteFromName(name || '?');

    return (
        <Avatar className={cn(SIZE_CLASSES[size], className)}>
            {avatarPath && <AvatarImage src={avatarPath} alt={name} />}
            <AvatarFallback
                className={cn(palette, 'text-white font-bold select-none')}
            >
                {getInitials(name) || '?'}
            </AvatarFallback>
        </Avatar>
    );
}
