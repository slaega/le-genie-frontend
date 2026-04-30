import { SiteHeader } from '@/components/organisms/site-header'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className={cn('flex-1 container mx-auto px-4 py-8', className)}>
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Le Génie — Plateforme de publication collaborative
      </footer>
    </div>
  )
}
