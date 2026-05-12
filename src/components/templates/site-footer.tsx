import Link from 'next/link';
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const blogLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/publications', label: 'Publications' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
];

const quickLinks = [
    { href: '/auth/sign-in', label: 'Connexion' },
    { href: '/privacy', label: 'Politique de confidentialité' },
    { href: '/terms', label: "Conditions d'utilisation" },
    { href: '/sitemap', label: 'Plan du site' },
];

const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Mail, label: 'Email', href: '#' },
];

export function SiteFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-16">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Col 1 — Brand */}
                    <div>
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-xl text-white mb-3"
                        >
                            <BookOpen className="h-5 w-5 text-blue-400" />
                            Le Génie<span className="text-blue-400">.</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-5">
                            Une plateforme collaborative pour partager des
                            idées, tutoriels et articles techniques avec la
                            communauté.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Col 2 — Blog */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Blog
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {blogLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3 — Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Liens rapides
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4 — Newsletter */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Newsletter
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                            Recevez les meilleurs articles chaque semaine dans
                            votre boîte mail.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Input
                                type="email"
                                placeholder="votre@email.com"
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm h-9 focus-visible:ring-blue-500"
                            />
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                                S'abonner
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>
                        © {new Date().getFullYear()} Le Génie — Tous droits
                        réservés.
                    </p>
                    <p>Fait avec ❤️ par la communauté</p>
                </div>
            </div>
        </footer>
    );
}
