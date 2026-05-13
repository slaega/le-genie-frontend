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
        <section className="border-b border-border">
            <div className="container mx-auto px-4 py-20 lg:py-28">
                {/* Eyebrow — plain-text brand label, no chip */}
                <p className="mb-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Plateforme collaborative
                </p>

                {/* Headline — stepped opacity, last word carries the indigo */}
                <h1 className="text-[40px] sm:text-[60px] lg:text-[72px] font-bold tracking-tight leading-[1.04] max-w-3xl">
                    <span className="text-foreground">Apprenez.</span>{' '}
                    <span className="text-foreground/70">Partagez.</span>{' '}
                    <span className="text-primary">Progressez.</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-6 max-w-xl text-[16px] text-muted-foreground leading-[1.65]">
                    Le Génie est une plateforme collaborative où chacun peut
                    partager ses connaissances, co-écrire avec d&apos;autres et
                    apprendre des meilleurs.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/publications">
                            <BookOpen className="h-4 w-4" />
                            Explorer les publications
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="gap-2 group"
                    >
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex flex-col gap-4">
                            <Icon
                                className="h-5 w-5 text-foreground/70"
                                strokeWidth={1.6}
                            />
                            <div>
                                <h3 className="font-bold text-[15px] text-foreground mb-1.5">
                                    {title}
                                </h3>
                                <p className="text-[13px] text-muted-foreground leading-[1.7]">
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
