import Link from 'next/link';
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/atoms/theme-toggle';

const NAV = [
    { href: '/', label: 'Accueil' },
    { href: '/publications', label: 'Blog' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
];

const LEGAL = [
    { href: '/auth/sign-in', label: 'Connexion' },
    { href: '/privacy', label: 'Confidentialité' },
    { href: '/terms', label: 'CGU' },
];

const SOCIAL = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Mail, label: 'Email', href: '#' },
];

export function SiteFooter() {
    return (
        <footer className="mt-24 border-t border-border bg-muted/20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-base text-foreground"
                        >
                            <BookOpen className="h-4 w-4" />
                            Le Génie
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Une plateforme collaborative pour apprendre, partager
                            et progresser ensemble — accessible à tous.
                        </p>
                        <div className="flex items-center gap-2">
                            {SOCIAL.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">
                            Navigation
                        </h4>
                        <ul className="space-y-2.5">
                            {NAV.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">
                            Informations
                        </h4>
                        <ul className="space-y-2.5 mb-6">
                            {LEGAL.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Créé par{' '}
                            <span className="text-foreground font-semibold">
                                Le Génie
                            </span>
                            . Ouvert à la communauté.
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Le Génie — Tous droits réservés.</p>
                    <div className="flex items-center gap-4">
                        <p>Fait avec soin.</p>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
}
