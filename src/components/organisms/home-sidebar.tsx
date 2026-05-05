import Link from 'next/link'
import { Tag, TrendingUp, Users, BookOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { serverApi } from '@/lib/api/server'

interface CmsStats {
  totalPosts: number
  totalAuthors: number
  totalTags: number
  totalComments: number
}

interface CmsTag {
  name: string
  count: number
}

interface CmsAuthor {
  id: string
  name: string
  avatarPath: string | null
  professionalRole: string
  postCount: number
}

const FALLBACK_CATEGORIES = [
  { label: 'Développement web', count: 0 },
  { label: 'DevOps & Cloud', count: 0 },
  { label: 'Intelligence artificielle', count: 0 },
  { label: 'UI / UX Design', count: 0 },
  { label: 'Sécurité', count: 0 },
]

export async function HomeSidebar() {
  const [statsResult, tagsResult, authorsResult] = await Promise.allSettled([
    serverApi.get<CmsStats>('/cms/stats'),
    serverApi.get<{ items: CmsTag[] }>('/cms/tags'),
    serverApi.get<{ items: CmsAuthor[] }>('/cms/authors'),
  ])

  const stats: CmsStats =
    statsResult.status === 'fulfilled'
      ? statsResult.value
      : { totalPosts: 0, totalAuthors: 0, totalTags: 0, totalComments: 0 }

  const tags: CmsTag[] =
    tagsResult.status === 'fulfilled' ? tagsResult.value.items : []

  const authors: CmsAuthor[] =
    authorsResult.status === 'fulfilled' ? authorsResult.value.items : []

  const topAuthors = authors.slice(0, 4)
  const tagCloud = tags.slice(0, 15)

  const categories =
    tags.length > 0
      ? tags.slice(0, 5).map((t) => ({ label: t.name, count: t.count }))
      : FALLBACK_CATEGORIES

  return (
    <aside className="flex flex-col gap-8">

      {/* Top Authors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Auteurs populaires</h3>
        </div>
        <div className="flex flex-col gap-3">
          {topAuthors.length > 0 ? (
            topAuthors.map((author) => (
              <div key={author.id} className="flex items-center gap-3">
                <UserAvatar
                  name={author.name}
                  avatarPath={author.avatarPath}
                  size="md"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{author.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {author.professionalRole} · {author.postCount} article{author.postCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Aucun auteur disponible.</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Catégories</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => (
            <li key={cat.label}>
              <Link
                href={`/?tags=${encodeURIComponent(cat.label)}`}
                className="flex items-center justify-between w-full text-sm py-1 hover:text-primary transition-colors text-left"
              >
                <span>{cat.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">En chiffres</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalPosts, label: 'Publications' },
            { value: stats.totalAuthors, label: 'Auteurs' },
            { value: stats.totalTags, label: 'Tags' },
            { value: stats.totalComments, label: 'Commentaires' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center"
            >
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags cloud */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagCloud.length > 0 ? (
            tagCloud.map((tag) => (
              <Link
                key={tag.name}
                href={`/?tags=${encodeURIComponent(tag.name)}`}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {tag.name}
              </Link>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Aucun tag disponible.</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Newsletter */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-5">
        <h3 className="font-bold text-sm mb-1">Newsletter</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Recevez les meilleurs articles directement dans votre boîte mail.
        </p>
        <Input
          type="email"
          placeholder="votre@email.com"
          className="mb-2 text-sm h-9"
        />
        <Button size="sm" className="w-full text-xs">
          S'abonner
        </Button>
      </div>
    </aside>
  )
}
