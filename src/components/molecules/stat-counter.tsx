'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
    /** Target value to count up to. */
    value: number;
    /** Optional suffix appended after the number (e.g. "+", "k"). */
    suffix?: string;
    /** Animation duration in ms. Defaults to 1.4s. */
    duration?: number;
    className?: string;
}

/**
 * Counts up from 0 to `value` the first time it scrolls into view, then stops.
 * Uses IntersectionObserver — cheap and runs once per page load.
 */
export function StatCounter({
    value,
    suffix = '',
    duration = 1400,
    className,
}: StatCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || started) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        const start = performance.now();
        let raf = 0;
        function tick(now: number) {
            const t = Math.min(1, (now - start) / duration);
            // Ease-out cubic — fast start, gentle landing
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [started, value, duration]);

    return (
        <span ref={ref} className={className}>
            {display.toLocaleString('fr-FR')}
            {suffix}
        </span>
    );
}
