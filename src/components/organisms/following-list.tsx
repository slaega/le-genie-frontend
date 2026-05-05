'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api/client'
import { useAuth } from '@/providers/auth-provider'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { FollowButton } from '@/components/molecules/follow-button'
import { LoadingSpinner } from '@/components/atoms/loading-spinner'
import { EmptyState } from '@/components/atoms/empty-state'
import { Users } from 'lucide-react'

interface FollowedAuthor {
  id: string
  name: string
  avatarPath: string | null
  professionalRole: string | null
  followersCount: number
}

export function FollowingList() {
  const { user, isLoading: authLoading } = useAuth()
  const [authors, setAuthors] = useState<FollowedAuthor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    api
      .get<FollowedAuthor[]>(`/users/${user.id}/following`)
      .then((data) => setAuthors(data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [user])

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Impossible de charger vos abonnements.
      </p>
    )
  }

  if (authors.length === 0) {
    return (
      <EmptyState
        title="Aucun abonnement"
        description="Suivez des auteurs pour les retrouver ici."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {authors.map((author) => (
        <div
          key={author.id}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border transition-colors"
        >
          <Link href={`/authors/${author.id}`} className="shrink-0">
            <UserAvatar
              name={author.name}
              avatarPath={author.avatarPath}
              size="lg"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/authors/${author.id}`} className="hover:underline">
              <p className="font-semibold text-sm leading-tight">{author.name}</p>
            </Link>
            {author.professionalRole && (
              <p className="text-xs text-muted-foreground mt-0.5">{author.professionalRole}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                {author.followersCount} abonné{author.followersCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <FollowButton
              authorId={author.id}
              initialFollowing
              initialCount={author.followersCount}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
