import { Tag, TrendingUp, Users, BookOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const TOP_AUTHORS = [
  { name: 'Alice Dupont', role: 'Développeuse full-stack', initials: 'AD' },
  { name: 'Benoit Martin', role: 'Ingénieur DevOps', initials: 'BM' },
  { name: 'Claire Morel', role: 'Designer UX', initials: 'CM' },
  { name: 'David Bernard', role: 'Architecte logiciel', initials: 'DB' },
]

const CATEGORIES = [
  { label: 'Développement web', count: 24 },
  { label: 'DevOps & Cloud', count: 18 },
  { label: 'Intelligence artificielle', count: 15 },
  { label: 'UI / UX Design', count: 10 },
  { label: 'Sécurité', count: 8 },
]

const TAGS = [
  'TypeScript', 'React', 'Next.js', 'Docker', 'Node.js',
  'Python', 'GraphQL', 'PostgreSQL', 'Tailwind', 'CI/CD',
]

export function HomeSidebar() {
  return (
    <aside className="flex flex-col gap-8">

      {/* Top Authors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Auteurs populaires</h3>
        </div>
        <div className="flex flex-col gap-3">
          {TOP_AUTHORS.map((author) => (
            <div key={author.name} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {author.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{author.name}</p>
                <p className="text-xs text-muted-foreground truncate">{author.role}</p>
              </div>
            </div>
          ))}
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
          {CATEGORIES.map((cat) => (
            <li key={cat.label}>
              <button className="flex items-center justify-between w-full text-sm py-1 hover:text-primary transition-colors text-left">
                <span>{cat.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {cat.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Today's stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Aujourd'hui</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '12', label: 'Publications' },
            { value: '3.4k', label: 'Lecteurs' },
            { value: '47', label: 'Commentaires' },
            { value: '820', label: 'Partages' },
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

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            >
              {tag}
            </button>
          ))}
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
