'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { editorExtensions } from './extensions';
import { EditorToolbar } from './editor-toolbar';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorStatsBar } from './editor-stats-bar';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';

/* ── Public ref API ───────────────────────────────────────────────────────── */

export interface BlogEditorRef {
    /** Raw JSON — may still contain blob: image URLs if flush hasn't run. */
    getJSON: () => Record<string, unknown> | null;
    getEditor: () => Editor | null;
    /** True when images were inserted but not yet uploaded to the server. */
    hasPendingImages: () => boolean;
    /**
     * Upload every pending blob: image via `uploadFn`, replace the src in the
     * editor content in-place, then return the fully-resolved JSON.
     * No-op (returns current JSON) when there are no pending images.
     */
    flushImages: (
        uploadFn: (file: File) => Promise<string | null>
    ) => Promise<Record<string, unknown> | null>;
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface BlogEditorProps {
    defaultContent?: Record<string, unknown> | string | null;
    onAutoSave?: (json: Record<string, unknown>) => Promise<void>;
    autoSaveInterval?: number;
    editorRef?: Ref<BlogEditorRef>;
    className?: string;
}

/* ── JSON utilities ───────────────────────────────────────────────────────── */

function parseContent(
    raw: Record<string, unknown> | string | null | undefined
) {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return undefined; }
    }
    return raw;
}

/**
 * Remove image nodes whose `src` is a blob: URL from the document JSON.
 * Used for autosave so draft content never contains browser-local URLs.
 */
function stripBlobImages(
    node: Record<string, unknown>
): Record<string, unknown> | null {
    if (node.type === 'image') {
        const src = (node.attrs as Record<string, unknown>)?.src;
        if (typeof src === 'string' && src.startsWith('blob:')) return null;
    }
    if (Array.isArray(node.content)) {
        return {
            ...node,
            content: (node.content as Record<string, unknown>[])
                .map(stripBlobImages)
                .filter((n): n is Record<string, unknown> => n !== null),
        };
    }
    return node;
}

/**
 * Recursively walk a TipTap document JSON tree, upload every image whose
 * `src` starts with `blob:`, and replace it with the returned server URL.
 * Throws if an upload returns null (caller should surface the error).
 */
async function resolveBlobsInJSON(
    node: Record<string, unknown>,
    blobMap: Map<string, File>,
    uploadFn: (file: File) => Promise<string | null>
): Promise<Record<string, unknown>> {
    if (node.type === 'image' && node.attrs) {
        const attrs = node.attrs as Record<string, unknown>;
        const src = attrs.src as string | undefined;
        if (src?.startsWith('blob:')) {
            const file = blobMap.get(src);
            if (file) {
                const url = await uploadFn(file);
                if (!url) throw new Error(`Upload failed for ${src}`);
                blobMap.delete(src);
                URL.revokeObjectURL(src);
                return { ...node, attrs: { ...attrs, src: url } };
            }
        }
        return node;
    }

    if (Array.isArray(node.content)) {
        // Sequential — avoid overwhelming the server with parallel uploads.
        const resolved: Record<string, unknown>[] = [];
        for (const child of node.content as Record<string, unknown>[]) {
            resolved.push(await resolveBlobsInJSON(child, blobMap, uploadFn));
        }
        return { ...node, content: resolved };
    }

    return node;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function BlogEditor({
    defaultContent,
    onAutoSave,
    autoSaveInterval = 30_000,
    editorRef,
    className,
}: BlogEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    /** Tracks files for images inserted as blob: URLs, awaiting flush. */
    const pendingBlobs = useRef<Map<string, File>>(new Map());

    /** Called by the toolbar when the user picks an image file. */
    const handleInternalImageUpload = useCallback(
        (file: File): Promise<string> => {
            const blobUrl = URL.createObjectURL(file);
            pendingBlobs.current.set(blobUrl, file);
            return Promise.resolve(blobUrl);
        },
        []
    );

    const scheduleAutoSave = useCallback(
        (editor: Editor) => {
            if (!onAutoSave) return;
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(async () => {
                const rawJson = editor.getJSON() as Record<string, unknown>;
                // Strip unresolved blob images so autosave never persists local URLs.
                const safeJson =
                    pendingBlobs.current.size > 0
                        ? (stripBlobImages(rawJson) ?? rawJson)
                        : rawJson;
                setIsSaving(true);
                try {
                    await onAutoSave(safeJson);
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
                    'prose-h1:text-4xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight',
                    'prose-h2:text-3xl prose-h2:font-semibold prose-h2:tracking-tight',
                    'prose-h3:text-2xl prose-h3:font-semibold',
                    'prose-h4:text-xl prose-h4:font-semibold',
                    'prose-p:leading-8 prose-p:text-[1.0625rem]',
                    'prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-primary/40 prose-a:transition-colors hover:prose-a:decoration-primary',
                    'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:bg-[#0d1117] prose-pre:text-[#e6edf3] prose-pre:border prose-pre:rounded-xl prose-pre:shadow-sm',
                    'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:italic prose-blockquote:text-muted-foreground',
                    'prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto',
                    'prose-li:my-1',
                    'prose-hr:border-border',
                    'prose-table:rounded-lg prose-table:overflow-hidden',
                    'prose-th:bg-muted prose-th:font-semibold',
                    '[&_.ProseMirror-focused]:outline-none',
                    '[&_.is-empty::before]:content-[attr(data-placeholder)] [&_.is-empty::before]:text-muted-foreground/30 [&_.is-empty::before]:float-left [&_.is-empty::before]:pointer-events-none [&_.is-empty::before]:h-0',
                    '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
                    '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2',
                    '[&_li[data-type=taskItem]>label]:mt-0.5'
                ),
            },
        },
        onUpdate: ({ editor }) => scheduleAutoSave(editor),
    });

    /** Upload all pending blob images and update the editor content in-place. */
    const flushImages = useCallback(
        async (
            uploadFn: (file: File) => Promise<string | null>
        ): Promise<Record<string, unknown> | null> => {
            if (!editor) return null;
            if (pendingBlobs.current.size === 0) {
                return editor.getJSON() as Record<string, unknown>;
            }
            const json = editor.getJSON() as Record<string, unknown>;
            const resolved = await resolveBlobsInJSON(
                json,
                pendingBlobs.current,
                uploadFn
            );
            // Update editor in-place without triggering autosave (emitUpdate=false).
            editor.commands.setContent(resolved, false);
            return editor.getJSON() as Record<string, unknown>;
        },
        [editor]
    );

    // Expose the ref API.
    useEffect(() => {
        if (!editorRef || !editor) return;
        const ref = editorRef as React.MutableRefObject<BlogEditorRef>;
        ref.current = {
            getJSON: () => editor.getJSON() as Record<string, unknown>,
            getEditor: () => editor,
            hasPendingImages: () => pendingBlobs.current.size > 0,
            flushImages,
        };
    }, [editor, editorRef, flushImages]);

    // Revoke all blob URLs on unmount to avoid memory leaks.
    useEffect(() => {
        const blobs = pendingBlobs.current;
        return () => {
            for (const url of blobs.keys()) URL.revokeObjectURL(url);
            blobs.clear();
            clearTimeout(saveTimer.current);
        };
    }, []);

    if (!editor) return null;

    return (
        <div className={cn('flex flex-col', className)}>
            <EditorToolbar
                editor={editor}
                onImageUpload={handleInternalImageUpload}
            />
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
