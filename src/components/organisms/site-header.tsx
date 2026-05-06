'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu, PenSquare, User, LogOut, BookOpen, LayoutDashboard } from 'lucide-react'
import { NotificationBell } from '@/components/molecules/notification-bell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { useAuth } from '@/providers/auth-provider'
import { useCreatePost } from '@/hooks/mutations/use-create-post'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function SiteHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { mutateAsync: createPost, isPending } = useCreatePost()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  async function handleNewPost() {
    try {
      const post = await createPost()
      router.push(`/post/${post.id}/edit`)
    } catch {
      toast.error('Erreur lors de la création de la publication')
    }
  }

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/publications', label: 'Catégorie' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span>
            Le Génie<span className="text-blue-400">.</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Search — inline form that expands on click */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-8 w-40 sm:w-56 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
                aria-label="Lancer la recherche"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Notification bell — uniquement pour les utilisateurs connectés */}
          {isAuthenticated && !isLoading && <NotificationBell />}

          {/* Write button (authenticated) */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 p-0 ml-1"
                >
                  <UserAvatar name={user.name} avatarPath={user.avatarPath} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/me" className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/publications?mine=true" className="gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4" />
                    Mes publications
                  </Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2 cursor-pointer text-indigo-500 focus:text-indigo-500">
                        <LayoutDashboard className="h-4 w-4" />
                        Panel admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive gap-2 focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium py-1 transition-colors ${
                      pathname === link.href ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {link.label}
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
