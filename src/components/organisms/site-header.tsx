'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, PenSquare, BookOpen } from 'lucide-react'
import { NotificationBell } from '@/components/molecules/notification-bell'
import { SearchBar } from '@/components/molecules/search-bar'
import { UserMenu } from '@/components/molecules/user-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { useCreatePost } from '@/hooks/mutations/use-create-post'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/publications', label: 'Catégorie' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { mutateAsync: createPost, isPending } = useCreatePost()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function handleNewPost() {
    try {
      const post = await createPost()
      router.push(`/post/${post.id}/edit`)
    } catch {
      toast.error('Erreur lors de la création de la publication')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span>Le Génie<span className="text-blue-400">.</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          <SearchBar />

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Notifications */}
          {isAuthenticated && !isLoading && <NotificationBell />}

          {/* Write button */}
          {isAuthenticated && (
            <Button
              size="sm"
              variant="ghost"
              className="hidden md:flex gap-2 ml-2 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handleNewPost}
              disabled={isPending}
            >
              <PenSquare className="h-4 w-4" />
              {isPending ? 'Création…' : 'Écrire'}
            </Button>
          )}

          {/* User menu / Login */}
          {isAuthenticated && user ? (
            <UserMenu
              user={user}
              isPending={isPending}
              onNewPost={handleNewPost}
              onLogout={logout}
            />
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="ml-2 border-gray-600 bg-transparent text-white hover:bg-gray-800 hover:text-white hover:border-gray-500"
            >
              <Link href="/auth/sign-in">Connexion</Link>
            </Button>
          )}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 ml-1 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-gray-900 text-white border-gray-800">
              <div className="flex items-center gap-2 font-bold text-lg mb-6 mt-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Le Génie<span className="text-blue-400">.</span>
              </div>
              <nav className="flex flex-col gap-3">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`text-sm font-medium py-1 transition-colors ${
                      pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <button
                    onClick={handleNewPost}
                    disabled={isPending}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    <PenSquare className="h-4 w-4" />
                    Écrire un article
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
