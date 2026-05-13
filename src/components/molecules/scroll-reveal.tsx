'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
    children: ReactNode;
    /** Delay in ms before the element animates in (for stagger effects). */
    delay?: number;
    className?: string;
}

/**
 * Wraps children with a `.reveal` class that fades + slides up the first time
 * the element enters the viewport. After that it stays visible (one-shot).
 *
 * Cheap: a single IntersectionObserver per instance, disconnected on reveal.
 * Honors `prefers-reduced-motion` via the CSS rule in globals.css.
 *
 * Renders a plain <div> wrapper — keep usage simple and predictable.
 */
export function ScrollReveal({
    children,
    delay = 0,
    className,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setTimeout(() => el.classList.add('is-visible'), delay);
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={ref} className={cn('reveal', className)}>
            {children}
        </div>
    );
}
