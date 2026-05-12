'use client';

import type { Editor } from '@tiptap/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface EditorStatsBarProps {
    editor: Editor;
    isSaving?: boolean;
    lastSaved?: Date | null;
}

function wordsToReadingTime(words: number): string {
    const wpm = 200;
    const minutes = Math.ceil(words / wpm);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
}

export function EditorStatsBar({
    editor,
    isSaving,
    lastSaved,
}: EditorStatsBarProps) {
    const chars = editor.storage.characterCount?.characters() ?? 0;
    const words = editor.storage.characterCount?.words() ?? 0;

    return (
        <div className="flex items-center gap-5 border-t border-border/50 px-8 py-1.5 text-[11px] text-muted-foreground/40">
            <span>{words} {words === 1 ? 'mot' : 'mots'}</span>
            <span>{wordsToReadingTime(words)} de lecture</span>
            <span className="hidden sm:block">{chars} car.</span>

            <div className="ml-auto flex items-center gap-1.5">
                {isSaving ? (
                    <>
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        <span>Enregistrement…</span>
                    </>
                ) : lastSaved ? (
                    <>
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500/70" />
                        <span>
                            {lastSaved.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </>
                ) : null}
            </div>
        </div>
    );
}
