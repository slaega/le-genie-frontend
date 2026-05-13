'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { editorExtensions } from './extensions';
import { EditorToolbar } from './editor-toolbar';
import { EditorBubbleMenu } from './editor-bubble-menu';
import { EditorStatsBar } from './editor-stats-bar';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';

/* ── Title utilities ──────────────────────────────────────────────────────── */

type TiptapNode = {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: TiptapNode[];
    text?: string;
};

/**
 * Walks a TipTap doc and returns the plain-text content of the first
 * heading-1 node. Returns empty string when no H1 exists yet.
 *
 * The editor uses H1 as the "title" — Medium / Notion-style. The body
 * starts at the second block.
 */
export function extractTitleFromContent(
    content: Record<string, unknown> | null | undefined
): string {
    if (!content) return '';
    const doc = content as TiptapNode;
    const children = doc.content;
    if (!Array.isArray(children)) return '';
    for (const node of children) {
        if (node.type === 'heading' && node.attrs?.level === 1) {
            return nodeText(node).trim();
        }
    }
    return '';
}

function nodeText(node: TiptapNode): string {
    if (node.type === 'text' && typeof node.text === 'string') return node.text;
    if (!Array.isArray(node.content)) return '';
    return node.content.map(nodeText).join('');
}

/**
 * Guarantees the doc starts with an H1 heading. When the post already has a
 * stored title but the content has no H1 yet, we prepend one carrying that
 * title (so existing posts open seamlessly in the new editor).
 *
 * Idempotent — returns the doc unchanged when the first block is already an H1.
 */
export function ensureTitleHeading(
    content: Record<string, unknown> | null | undefined,
    fallbackTitle: string
): Record<string, unknown> {
    const titleHeading = {
        type: 'heading',
        attrs: { level: 1 },
        ...(fallbackTitle.trim()
            ? { content: [{ type: 'text', text: fallbackTitle.trim() }] }
            : {}),
    };

    if (!content) {
        return {
            type: 'doc',
            content: [titleHeading, { type: 'paragraph' }],
        };
    }

    const doc = content as TiptapNode;
    const children = doc.content;

    if (!Array.isArray(children) || children.length === 0) {
        return {
            type: doc.type ?? 'doc',
            content: [titleHeading, { type: 'paragraph' }],
        };
    }

    const first = children[0];
    if (first.type === 'heading' && first.attrs?.level === 1) {
        return content;
    }

    return {
        type: doc.type ?? 'doc',
        content: [titleHeading, ...children],
    };
}

/* ── Public ref API ───────────────────────────────────────────────────────── */

export interface BlogEditorRef {
    /** Raw JSON — may still contain blob: image URLs if flush hasn't run. */
    getJSON: () => Record<string, unknown> | null;
    /** Plain-text content of the first H1 — used as post title. */
    getTitle: () => string;
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
        try {
            return JSON.parse(raw);
        } catch {
            return undefined;
        }
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
                    'outline-none min-h-[480px] px-0 py-4',
                    'prose prose-neutral dark:prose-invert max-w-none',
                    // H1 = title — large, no margin top so it sits at the page top.
                    'prose-h1:text-[2.5rem] sm:prose-h1:text-[3rem] prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-[1.1] prose-h1:mt-0 prose-h1:mb-4',
                    'prose-h2:text-[1.75rem] prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-3',
                    'prose-h3:text-[1.375rem] prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2',
                    'prose-h4:text-[1.125rem] prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2',
                    'prose-p:leading-[1.75] prose-p:text-[1.0625rem] prose-p:text-foreground/85',
                    'prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-primary/40 hover:prose-a:decoration-primary prose-a:transition-colors',
                    'prose-strong:text-foreground prose-strong:font-semibold',
                    'prose-code:text-[0.875em] prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:shadow-sm',
                    'prose-blockquote:not-italic prose-blockquote:border-l-[3px] prose-blockquote:border-foreground/30 prose-blockquote:bg-transparent prose-blockquote:py-0 prose-blockquote:pl-5 prose-blockquote:text-foreground/70',
                    'prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto',
                    'prose-li:my-1 prose-li:marker:text-muted-foreground/50',
                    'prose-hr:border-border/60 prose-hr:my-10',
                    'prose-table:rounded-lg prose-table:overflow-hidden',
                    'prose-th:bg-muted prose-th:font-semibold',
                    '[&_.ProseMirror-focused]:outline-none',
                    // Placeholder: title-sized for H1, regular for the rest.
                    '[&_.is-empty::before]:content-[attr(data-placeholder)] [&_.is-empty::before]:text-muted-foreground/25 [&_.is-empty::before]:float-left [&_.is-empty::before]:pointer-events-none [&_.is-empty::before]:h-0',
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
            getTitle: () =>
                extractTitleFromContent(
                    editor.getJSON() as Record<string, unknown>
                ),
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
