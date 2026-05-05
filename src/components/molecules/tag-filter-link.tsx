'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TagFilterLinkProps {
  name: string
  count?: number
  variant?: 'list' | 'pill'
}

/**
 * Client wrapper — lit useSearchParams() pour surligner le tag actif.
 * Utilisé dans HomeSidebar (server component) via import direct.
 */
export function TagFilterLink({ name, count, variant = 'list' }: TagFilterLinkProps) {
  const searchParams = useSearchParams()
  const activeTags = (searchParams.get('tags') ?? '').split(',').filter(Boolean)
  const isActive = activeTags.includes(name)

  if (variant === 'pill') {
    return (
      <Link
        href={`/?tags=${encodeURIComponent(name)}`}
        className={cn(
          'text-xs px-3 py-1.5 rounded-full border transition-colors',
          isActive
            ? 'border-primary bg-primary/10 text-primary font-medium'
            : 'border-border hover:border-primary hover:text-primary'
        )}
      >
        {name}
      </Link>
    )
  }

  return (
    <Link
      href={isActive ? '/' : `/?tags=${encodeURIComponent(name)}`}
      className={cn(
        'flex items-center justify-between w-full text-sm py-1 transition-colors text-left',
        isActive ? 'text-primary font-medium' : 'hover:text-primary'
      )}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            isActive
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground bg-muted'
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}
