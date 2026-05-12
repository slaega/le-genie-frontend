'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, PenSquare, Search, BookOpen, X } from 'lucide-react';
import { NotificationBell } from '@/components/molecules/notification-bell';
import { UserMenu } from '@/components/molecules/user-menu';
import { SearchOverlay } from '@/components/organisms/search-overlay';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useCreatePost } from '@/hooks/mutations/use-create-post';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '/', label: 'Accueil' },
    { href: '/publications', label: 'Blog' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { mutateAsync: createPost, isPending } = useCreatePost();
    const router = useRouter();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Shadow on scroll
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    async function handleNewPost() {
        try {
            const post = await createPost();
            router.push(`/post/${post.id}/edit`);
        } catch {
            toast.error('Erreur lors de la création de la publication');
        }
    }

    return (
        <>
            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

            <header
                className={cn(
                    'sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border transition-shadow duration-200',
                    scrolled && 'shadow-sm'
                )}
            >
                <div className="container mx-auto flex h-14 items-center gap-6 px-4">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-lg shrink-0 text-foreground"
                    >
                        <BookOpen className="h-5 w-5" />
                        Le Génie
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-sm transition-colors duration-150',
                                    pathname === href
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 ml-auto">
                        {/* Search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Rechercher"
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </button>

                        {/* Notifications */}
                        {isAuthenticated && !isLoading && <NotificationBell />}

                        {/* Write button — desktop */}
                        {isAuthenticated && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="hidden md:flex gap-1.5 ml-1"
                                onClick={handleNewPost}
                                disabled={isPending}
                            >
                                <PenSquare className="h-4 w-4" />
                                {isPending ? 'Création…' : 'Écrire'}
                            </Button>
                        )}

                        {/* User menu / Login */}
                        {!isLoading && (
                            <>
                                {isAuthenticated && user ? (
                                    <UserMenu
                                        user={user}
                                        isPending={isPending}
                                        onNewPost={handleNewPost}
                                        onLogout={logout}
                                    />
                                ) : (
                                    <Button asChild size="sm" className="ml-1">
                                        <Link href="/auth/sign-in">
                                            Connexion
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Menu"
                        >
                            {mobileOpen ? (
                                <X className="h-[18px] w-[18px]" />
                            ) : (
                                <Menu className="h-[18px] w-[18px]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile nav drawer */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm transition-colors',
                                    pathname === href
                                        ? 'text-foreground font-medium bg-muted'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                        {isAuthenticated && (
                            <button
                                onClick={handleNewPost}
                                disabled={isPending}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                            >
                                <PenSquare className="h-4 w-4" />
                                Écrire un article
                            </button>
                        )}
                    </div>
                )}
            </header>
        </>
    );
}
