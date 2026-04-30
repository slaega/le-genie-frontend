'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenSquare, BookOpen, User, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { useAuth } from '@/providers/auth-provider'
import { useCreatePost } from '@/hooks/mutations/use-create-post'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { mutateAsync: createPost, isPending } = useCreatePost()
  const router = useRouter()
  const pathname = usePathname()

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
    { href: '/publications', label: 'Publications' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
          Le Génie
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              asChild
              className={pathname === link.href ? 'text-primary' : 'text-muted-foreground'}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated && (
            <Button
              size="sm"
              variant="default"
              className="hidden md:flex gap-2"
              onClick={handleNewPost}
              disabled={isPending}
            >
              <PenSquare className="h-4 w-4" />
              {isPending ? 'Création...' : 'Nouvelle publication'}
            </Button>
          )}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
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
                  <Link href="/me" className="gap-2">
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/publications?mine=true" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Mes publications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive gap-2 focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/sign-in">Connexion</Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <Button key={link.href} variant="ghost" asChild className="justify-start">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                {isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="default"
                      className="gap-2 justify-start"
                      onClick={handleNewPost}
                      disabled={isPending}
                    >
                      <PenSquare className="h-4 w-4" />
                      Nouvelle publication
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
