import { generateHTML } from '@tiptap/html';
import { viewExtensions } from './extensions/view-extensions';
import { cn } from '@/lib/utils';

interface BlogViewerProps {
    content: Record<string, unknown> | string | null;
    /**
     * Skip the first H1 when rendering. Use this when the title is already
     * shown separately above the article body — prevents duplication for the
     * new "H1-as-title" editor pattern.
     */
    skipTitle?: boolean;
    className?: string;
}

function parseDoc(
    content: Record<string, unknown> | string | null
): Record<string, unknown> | null {
    if (!content) return null;
    if (typeof content === 'string') {
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    }
    return content;
}

/** Drops the very first node when it is a heading-1 — idempotent otherwise. */
function stripLeadingH1(doc: Record<string, unknown>): Record<string, unknown> {
    const children = (doc as { content?: unknown[] }).content;
    if (!Array.isArray(children) || children.length === 0) return doc;
    const first = children[0] as {
        type?: string;
        attrs?: { level?: number };
    };
    if (first.type === 'heading' && first.attrs?.level === 1) {
        return { ...doc, content: children.slice(1) };
    }
    return doc;
}

export function BlogViewer({
    content,
    skipTitle = false,
    className,
}: BlogViewerProps) {
    const parsed = parseDoc(content);
    if (!parsed) {
        return (
            <div
                className={cn(
                    'text-muted-foreground italic text-sm',
                    className
                )}
            >
                Aucun contenu.
            </div>
        );
    }

    const doc = skipTitle ? stripLeadingH1(parsed) : parsed;
    const html = generateHTML(doc, viewExtensions);

    return (
        <div
            className={cn(
                // Base prose — neutral with comfortable reading width.
                'prose prose-neutral dark:prose-invert max-w-none',
                // Headings — editorial weight, tighter tracking.
                'prose-h1:text-[2.25rem] prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight prose-h1:mt-12 prose-h1:mb-4',
                'prose-h2:text-[1.625rem] prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-foreground',
                'prose-h3:text-[1.25rem] prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2',
                'prose-h4:text-[1.0625rem] prose-h4:font-semibold prose-h4:mt-6',
                // Body — generous line-height for long-form reading.
                'prose-p:leading-[1.85] prose-p:text-[1.0625rem] prose-p:text-foreground/85',
                // Links.
                'prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 prose-a:decoration-primary/40 hover:prose-a:decoration-primary prose-a:transition-colors',
                // Strong / em.
                'prose-strong:font-semibold prose-strong:text-foreground prose-em:italic',
                // Inline code.
                'prose-code:text-[0.875em] prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
                // Code blocks.
                'prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:shadow-sm prose-pre:overflow-x-auto',
                // Blockquote — neutral left rule, no chromatic accent.
                'prose-blockquote:not-italic prose-blockquote:border-l-[3px] prose-blockquote:border-foreground/30 prose-blockquote:bg-transparent prose-blockquote:py-0 prose-blockquote:pl-6 prose-blockquote:text-foreground/75 prose-blockquote:font-normal',
                // Images.
                'prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto prose-img:my-6',
                // Lists.
                'prose-li:my-1.5 prose-li:marker:text-muted-foreground/50',
                'prose-ol:pl-5 prose-ul:pl-5',
                // HR.
                'prose-hr:border-border/60 prose-hr:my-10',
                // Tables.
                'prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-border',
                'prose-th:bg-muted prose-th:font-semibold prose-th:text-foreground prose-th:px-4 prose-th:py-2',
                'prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-border',
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
