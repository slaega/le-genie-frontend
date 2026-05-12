import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Users, Zap, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/organisms/site-header';
import { SiteFooter } from '@/components/templates/site-footer';
import { HomeArticles } from '@/components/organisms/home-articles';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Le Génie — Plateforme de publication collaborative',
    description:
        'Découvrez et partagez des publications techniques avec la communauté.',
    openGraph: {
        title: 'Le Génie',
        description:
            'Découvrez et partagez des publications techniques avec la communauté.',
    },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-border/40">
            {/* Decorative gradient blobs */}
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden
            >
                <div className="absolute -top-32 left-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-16 right-1/4 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-28 lg:py-36 relative">
                {/* Eyebrow badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    Plateforme collaborative de publication
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                    <span className="gradient-text">Apprenez.</span>
                    <br />
                    <span className="text-foreground/85">Partagez.</span>
                    <br />
                    <span className="text-foreground/50">Progressez.</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                    Le Génie est une plateforme collaborative où chacun peut
                    partager ses connaissances, co-écrire avec d&apos;autres et
                    apprendre des meilleurs.
                </p>

                {/* CTAs */}
                <div className="mt-10 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/15">
                        <Link href="/publications">
                            <BookOpen className="h-4 w-4" />
                            Explorer les publications
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="gap-2 group">
                        <Link href="/auth/sign-in">
                            Commencer à écrire
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Publiez',
        description:
            'Rédigez des articles riches avec un éditeur moderne. Code, images, listes — tout y est pour donner vie à vos idées.',
    },
    {
        icon: Users,
        title: 'Collaborez',
        description:
            "Invitez d'autres auteurs sur vos publications, co-rédigez et construisez des articles à plusieurs mains.",
    },
    {
        icon: Zap,
        title: 'Progressez',
        description:
            'Suivez des experts, découvrez des publications de qualité et montez en compétence à votre rythme.',
    },
] as const;

function Features() {
    return (
        <section className="border-b border-border/40">
            <div className="container mx-auto px-4 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex flex-col gap-4">
                            <div className="h-10 w-10 rounded-xl border border-primary/20 bg-primary/8 flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1.5">
                                    {title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                <Hero />
                <Features />
                <HomeArticles />
            </main>

            <SiteFooter />
        </div>
    );
}
