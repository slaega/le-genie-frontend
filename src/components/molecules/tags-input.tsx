'use client';

import { KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api/client';

interface TagsInputProps {
    postId: string;
    initialTags: string[];
}

export function TagsInput({ postId, initialTags }: TagsInputProps) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [input, setInput] = useState('');

    async function addTag(raw: string) {
        const name = raw.trim().replace(/,+$/, '').trim();
        if (!name || tags.includes(name)) {
            setInput('');
            return;
        }
        try {
            await api.post(`/post/${postId}/post-tags`, { name });
            setTags((prev) => [...prev, name]);
        } catch {
            // silently ignore
        }
        setInput('');
    }

    async function removeTag(name: string) {
        try {
            await api.delete(`/post/${postId}/post-tags/${name}`);
            setTags((prev) => prev.filter((t) => t !== name));
        } catch {
            // silently ignore
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        }
    }

    function handleBlur() {
        if (input.trim()) addTag(input);
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 text-[12px] text-muted-foreground border border-border/50"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="opacity-40 hover:opacity-80 transition-opacity ml-0.5"
                        aria-label={`Supprimer le tag ${tag}`}
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={tags.length === 0 ? 'Ajouter des tags…' : '+'}
                className="bg-transparent text-[12px] text-muted-foreground border-0 focus:outline-none placeholder:text-muted-foreground/30 w-28 py-0.5"
            />
        </div>
    );
}
