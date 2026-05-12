'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
    /** 'pill' = labelled pill button (default), 'icon' = icon-only square */
    variant?: 'pill' | 'icon';
}

export function ThemeToggle({ className, variant = 'pill' }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return variant === 'pill' ? (
            <div className={cn('h-7 w-28 rounded-full bg-muted animate-pulse', className)} />
        ) : (
            <div className={cn('h-9 w-9 rounded-lg bg-muted animate-pulse', className)} />
        );
    }

    const isDark = theme === 'dark';
    const toggle = () => setTheme(isDark ? 'light' : 'dark');

    if (variant === 'icon') {
        return (
            <button
                onClick={toggle}
                className={cn(
                    'h-9 w-9 flex items-center justify-center rounded-lg',
                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'transition-colors duration-200',
                    className
                )}
                aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
                <IconPair isDark={isDark} />
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            className={cn(
                'flex items-center gap-2 rounded-full border border-border',
                'bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs font-medium',
                'text-muted-foreground hover:text-foreground',
                'transition-colors duration-200',
                className
            )}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
            <IconPair isDark={isDark} size={14} />
            <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
    );
}

function IconPair({ isDark, size = 18 }: { isDark: boolean; size?: number }) {
    const px = `${size}px`;
    return (
        <span className="relative" style={{ width: px, height: px }}>
            <Sun
                style={{ width: px, height: px }}
                className={cn(
                    'absolute inset-0 transition-all duration-300 ease-in-out',
                    isDark
                        ? 'opacity-0 -rotate-90 scale-50'
                        : 'opacity-100 rotate-0 scale-100'
                )}
            />
            <Moon
                style={{ width: px, height: px }}
                className={cn(
                    'absolute inset-0 transition-all duration-300 ease-in-out',
                    isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 rotate-90 scale-50'
                )}
            />
        </span>
    );
}
