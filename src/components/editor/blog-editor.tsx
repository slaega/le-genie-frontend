'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { editorExtensions } from './extensions';
import { EditorToolbar } from './editor-toolbar';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorStatsBar } from './editor-stats-bar';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';

export interface BlogEditorRef {
    getJSON: () => Record<string, unknown> | null;
    getEditor: () => Editor | null;
}

interface BlogEditorProps {
    defaultContent?: Record<string, unknown> | string | null;
    onImageUpload?: (file: File) => Promise<string | null>;
    onAutoSave?: (json: Record<string, unknown>) => Promise<void>;
    autoSaveInterval?: number;
    editorRef?: Ref<BlogEditorRef>;
    className?: string;
}

function parseContent(
    raw: Record<string, unknown> | string | null | undefined
) {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return undefined;
        }
    }
    return raw;
}

export function BlogEditor({
    defaultContent,
    onImageUpload,
    onAutoSave,
    autoSaveInterval = 30_000,
    editorRef,
    className,
}: BlogEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const scheduleAutoSave = useCallback(
        (editor: Editor) => {
            if (!onAutoSave) return;
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await onAutoSave(
                        editor.getJSON() as Record<string, unknown>
                    );
                    setLastSaved(new Date());
                } finally {
                    setIsSaving(false);
                }
            }, autoSaveInterval);
        },
        [onAutoSave, autoSaveInterval]
    );

    const editor = useEditor({
        extensions: editorExtensions,
        content: parseContent(defaultContent),
        editorProps: {
            attributes: {
                class: cn(
                    'outline-none min-h-[400px] px-0 py-4',
                    'prose prose-neutral dark:prose-invert max-w-none',
                    // Headings
                    'prose-h1:text-4xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight',
                    'prose-h2:text-3xl prose-h2:font-semibold prose-h2:tracking-tight',
                    'prose-h3:text-2xl prose-h3:font-semibold',
                    'prose-h4:text-xl prose-h4:font-semibold',
                    // Body
                    'prose-p:leading-8 prose-p:text-[1.0625rem]',
                    // Links
                    'prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-primary/40 prose-a:transition-colors hover:prose-a:decoration-primary',
                    // Code
                    'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:bg-[#0d1117] prose-pre:text-[#e6edf3] prose-pre:border prose-pre:rounded-xl prose-pre:shadow-sm',
                    // Blockquote
                    'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:italic prose-blockquote:text-muted-foreground',
                    // Images
                    'prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto',
                    // Lists
                    'prose-li:my-1',
                    // HR
                    'prose-hr:border-border',
                    // Tables
                    'prose-table:rounded-lg prose-table:overflow-hidden',
                    'prose-th:bg-muted prose-th:font-semibold',
                    // Highlight
                    '[&_.ProseMirror-focused]:outline-none',
                    // Placeholder
                    '[&_.is-empty::before]:content-[attr(data-placeholder)] [&_.is-empty::before]:text-muted-foreground/30 [&_.is-empty::before]:float-left [&_.is-empty::before]:pointer-events-none [&_.is-empty::before]:h-0',
                    // Task lists
                    '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
                    '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2',
                    '[&_li[data-type=taskItem]>label]:mt-0.5'
                ),
            },
        },
        onUpdate: ({ editor }) => scheduleAutoSave(editor),
    });

    useEffect(() => {
        if (!editorRef || !editor) return;
        const ref = editorRef as React.MutableRefObject<BlogEditorRef>;
        ref.current = {
            getJSON: () => editor.getJSON() as Record<string, unknown>,
            getEditor: () => editor,
        };
    }, [editor, editorRef]);

    useEffect(() => () => clearTimeout(saveTimer.current), []);

    if (!editor) return null;

    return (
        <div className={cn('flex flex-col', className)}>
            <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
            <EditorBubbleMenu editor={editor} />
            <div className="flex-1">
                <EditorContent editor={editor} />
            </div>
            <EditorStatsBar
                editor={editor}
                isSaving={isSaving}
                lastSaved={lastSaved}
            />
        </div>
    );
}
