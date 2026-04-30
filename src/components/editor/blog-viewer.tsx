import { generateHTML } from '@tiptap/html'
import { viewExtensions } from './extensions/view-extensions'
import { cn } from '@/lib/utils'

interface BlogViewerProps {
  content: Record<string, unknown> | string | null
  className?: string
}

function parseDoc(content: Record<string, unknown> | string | null): Record<string, unknown> | null {
  if (!content) return null
  if (typeof content === 'string') {
    try { return JSON.parse(content) } catch { return null }
  }
  return content
}

export function BlogViewer({ content, className }: BlogViewerProps) {
  const doc = parseDoc(content)

  if (!doc) {
    return (
      <div className={cn('text-muted-foreground italic text-sm', className)}>
        Aucun contenu.
      </div>
    )
  }

  const html = generateHTML(doc, viewExtensions)

  return (
    <div
      className={cn(
        // Base prose
        'prose prose-neutral dark:prose-invert max-w-none',
        // Headings
        'prose-h1:text-4xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight prose-h1:mb-4',
        'prose-h2:text-3xl prose-h2:font-semibold prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-3',
        'prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2',
        'prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6',
        // Body
        'prose-p:leading-8 prose-p:text-[1.0625rem]',
        // Links
        'prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-primary/40 prose-a:transition-colors hover:prose-a:decoration-primary',
        // Inline code
        'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
        // Code blocks
        'prose-pre:bg-[#0d1117] prose-pre:text-[#e6edf3] prose-pre:border prose-pre:rounded-xl prose-pre:shadow-sm prose-pre:overflow-x-auto',
        // Blockquote
        'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:not-italic',
        // Images
        'prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto',
        // Lists
        'prose-li:my-1',
        // HR
        'prose-hr:border-border',
        // Tables
        'prose-table:rounded-lg prose-table:overflow-hidden',
        'prose-th:bg-muted prose-th:font-semibold',
        // Strong / em
        'prose-strong:font-semibold prose-em:italic',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
