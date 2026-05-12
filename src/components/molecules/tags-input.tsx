'use client';

import { KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
            // silently ignore — tag already exists server-side or network error
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
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 min-h-10">
            {tags.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                        aria-label={`Supprimer le tag ${tag}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Ajouter un tag…"
                className="h-8 w-36 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm"
            />
        </div>
    );
}
