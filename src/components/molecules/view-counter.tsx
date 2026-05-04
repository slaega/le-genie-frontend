'use client'

import { Eye } from 'lucide-react'
import { useViewCount } from '@/hooks/queries/use-view-count'
import { useTrackView } from '@/hooks/mutations/use-track-view'
import { cn } from '@/lib/utils'

interface ViewCounterProps {
  postId: string
  /** Whether to also track a view on mount. Defaults to true. */
  track?: boolean
  className?: string
}

function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function ViewCounter({ postId, track = true, className }: ViewCounterProps) {
  // Always call hooks unconditionally — pass an empty postId to disable tracking
  useTrackView(track ? postId : '')
  const { data } = useViewCount(postId)

  const count = data?.count ?? 0

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground',
        className,
      )}
      aria-label={`${count} vue${count > 1 ? 's' : ''}`}
    >
      <Eye className="h-4 w-4" />
      <span className="tabular-nums">{formatCount(count)}</span>
      <span className="hidden sm:inline">vue{count > 1 ? 's' : ''}</span>
    </div>
  )
}
