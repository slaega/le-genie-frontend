'use client';

import { useEffect, useRef, useState } from 'react';
import { Circle } from 'lucide-react';
import { onlineApi } from '@/lib/api';

function getFingerprint(): string {
    const key = 'lg_fp';
    let fp = sessionStorage.getItem(key);
    if (!fp) {
        fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(key, fp);
    }
    return fp;
}

export function OnlineCounter() {
    const [count, setCount] = useState<number | null>(null);
    const fingerprintRef = useRef<string>('');

    useEffect(() => {
        fingerprintRef.current = getFingerprint();

        async function pingAndCount() {
            try {
                const res = await onlineApi.ping(fingerprintRef.current);
                setCount(res.count);
            } catch {
                // silent fail
            }
        }

        pingAndCount();
        const interval = setInterval(pingAndCount, 60_000);
        return () => clearInterval(interval);
    }, []);

    if (count === null) return null;

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
            <span>
                {count.toLocaleString('fr-FR')} visiteur{count !== 1 ? 's' : ''}{' '}
                en ligne
            </span>
        </div>
    );
}
