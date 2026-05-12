'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfinitePosts } from '@/hooks/queries/use-posts';
import { postUrl } from '@/lib/post-url';

interface SearchOverlayProps {
    open: boolean;
    onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch recent published posts for suggestions
    const { data } = useInfinitePosts({ status: 'PUBLISHED', limit: 7 });
    const suggestions = data?.pages[0]?.items ?? [];

    // Filter by query
    const filtered = query.trim()
        ? suggestions.filter((p) =>
              p.title.toLowerCase().includes(query.toLowerCase())
          )
        : suggestions;

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [open]);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Click outside panel to close
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        },
        [onClose]
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/publications?q=${encodeURIComponent(q)}`);
        onClose();
    }

    function handleSelect(post: { id: string; slug: string | null }) {
        router.push(postUrl(post));
        onClose();
    }

    if (!open) return null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[200] bg-black/20 dark:bg-black/50 backdrop-blur-[2px] flex items-start justify-center pt-[10vh] px-4"
            onClick={handleBackdropClick}
        >
            {/* Panel */}
            <div
                ref={panelRef}
                className={cn(
                    'w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden',
                    'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
                )}
            >
                {/* Input */}
                <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                        ESC
                    </kbd>
                </form>

                {/* Results / Suggestions */}
                <div className="py-2 max-h-72 overflow-y-auto">
                    {filtered.length > 0 ? (
                        <>
                            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                {query ? 'Résultats' : 'Articles récents'}
                            </p>
                            {filtered.map((post) => (
                                <button
                                    key={post.id}
                                    type="button"
                                    onClick={() => handleSelect(post)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors group"
                                >
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
                                        {post.title || 'Sans titre'}
                                    </span>
                                </button>
                            ))}
                        </>
                    ) : query ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                            Aucun résultat pour « {query} »
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
