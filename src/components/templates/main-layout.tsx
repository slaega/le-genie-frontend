import { SiteHeader } from '@/components/organisms/site-header'
import { SiteFooter } from '@/components/templates/site-footer'
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
      <SiteFooter />
    </div>
  )
}
