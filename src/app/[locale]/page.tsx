import type { Metadata } from 'next';
import Link from 'next/link';
import {
    BookOpen,
    Users,
    Zap,
    ArrowRight,
    Quote,
    Sparkles,
} from 'lucide-react';
import { SiteHeader } from '@/components/organisms/site-header';
import { SiteFooter } from '@/components/templates/site-footer';
import { HomeArticles } from '@/components/organisms/home-articles';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/molecules/scroll-reveal';
import { StatCounter } from '@/components/molecules/stat-counter';

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
        <section className="relative border-b border-border overflow-hidden">
            {/* Floating decorative blob — animates lazily, GPU-cheap */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.18] blur-3xl animate-blob"
                style={{ background: 'var(--primary)' }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full opacity-[0.10] blur-3xl animate-blob"
                style={{
                    background: 'var(--primary)',
                    animationDelay: '6s',
                }}
            />

            <div className="container relative mx-auto px-4 py-20 lg:py-28">
                <ScrollReveal>
                    <p className="mb-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Plateforme collaborative
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={80}>
                    <h1 className="text-[40px] sm:text-[60px] lg:text-[76px] font-bold tracking-tight leading-[1.02] max-w-3xl">
                        <span className="text-foreground">Apprenez.</span>{' '}
                        <span className="text-foreground/65">Partagez.</span>{' '}
                        <span className="text-primary">Progressez.</span>
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={160}>
                    <p className="mt-7 max-w-xl text-[16px] sm:text-[17px] text-muted-foreground leading-[1.65]">
                        Une communauté ouverte où chacun peut publier ses
                        connaissances, co-écrire avec d&apos;autres auteurs et
                        apprendre des meilleurs — sans paywall, sans publicité,
                        sans bullshit.
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={240}>
                    <div className="mt-10 flex flex-wrap gap-3">
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
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

// ─── Stats — animated counters ────────────────────────────────────────────────

const STATS = [
    {
        value: 1240,
        suffix: '+',
        label: 'Publications',
        sublabel: 'rédigées par la communauté',
    },
    {
        value: 320,
        suffix: '+',
        label: 'Auteurs',
        sublabel: 'actifs ce trimestre',
    },
    {
        value: 18000,
        suffix: '+',
        label: 'Lecteurs',
        sublabel: 'uniques chaque mois',
    },
    { value: 47, suffix: '', label: 'Pays', sublabel: 'où Le Génie est lu' },
] as const;

function Stats() {
    return (
        <section className="border-b border-border/60 bg-muted/30">
            <div className="container mx-auto px-4 py-20 lg:py-24">
                <ScrollReveal>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-3">
                        En chiffres
                    </p>
                </ScrollReveal>
                <ScrollReveal delay={60}>
                    <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight max-w-2xl text-foreground leading-[1.1]">
                        Une communauté qui grandit, un savoir qui circule.
                    </h2>
                </ScrollReveal>

                <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {STATS.map((stat, i) => (
                        <ScrollReveal key={stat.label} delay={i * 80}>
                            <div>
                                <p className="text-[44px] sm:text-[54px] font-bold tracking-tight tabular-nums leading-none text-foreground">
                                    <StatCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                    />
                                </p>
                                <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.14em] text-foreground">
                                    {stat.label}
                                </p>
                                <p className="text-[12.5px] text-muted-foreground mt-1">
                                    {stat.sublabel}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
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
        <section className="border-b border-border/60">
            <div className="container mx-auto px-4 py-20 lg:py-24">
                <ScrollReveal>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-3">
                        Ce que vous pouvez faire
                    </p>
                </ScrollReveal>
                <ScrollReveal delay={60}>
                    <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1] mb-14">
                        Trois gestes, un seul écosystème.
                    </h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                    {FEATURES.map(({ icon: Icon, title, description }, i) => (
                        <ScrollReveal key={title} delay={i * 100}>
                            <div className="flex flex-col gap-5">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Icon
                                        className="h-5 w-5 text-primary"
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[18px] text-foreground mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-[14px] text-muted-foreground leading-[1.7]">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteSection() {
    return (
        <section className="border-b border-border/60 bg-foreground text-background relative overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    background:
                        'radial-gradient(circle at 70% 30%, var(--primary), transparent 60%)',
                }}
            />
            <div className="container relative mx-auto px-4 py-24 lg:py-32 max-w-3xl">
                <ScrollReveal>
                    <Quote
                        className="h-8 w-8 text-primary mb-6"
                        strokeWidth={1.5}
                    />
                </ScrollReveal>
                <ScrollReveal delay={80}>
                    <blockquote className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold leading-[1.2] tracking-tight">
                        La connaissance prend de la valeur quand elle{' '}
                        <span className="text-primary">circule</span>.
                    </blockquote>
                </ScrollReveal>
                <ScrollReveal delay={160}>
                    <p className="mt-6 text-[13px] uppercase tracking-[0.18em] text-background/50 font-bold">
                        — Le manifeste du Génie
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
    return (
        <section className="border-b border-border/60">
            <div className="container mx-auto px-4 py-20 lg:py-24">
                <ScrollReveal>
                    <div className="surface px-8 sm:px-12 py-12 sm:py-14 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
                        <div className="flex-1">
                            <Sparkles
                                className="h-5 w-5 text-primary mb-4"
                                strokeWidth={1.8}
                            />
                            <h3 className="text-[24px] sm:text-[30px] font-bold tracking-tight leading-[1.15] text-foreground">
                                Prêt à publier votre premier article&nbsp;?
                            </h3>
                            <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed max-w-md">
                                Inscrivez-vous en 30 secondes — pas de mot de
                                passe, juste un email. Votre brouillon vous
                                attend.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/auth/sign-in">
                                    Créer un compte
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="gap-2"
                            >
                                <Link href="/about">En savoir plus</Link>
                            </Button>
                        </div>
                    </div>
                </ScrollReveal>
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
                <Stats />
                <Features />
                <HomeArticles />
                <QuoteSection />
                <CtaBanner />
            </main>
            <SiteFooter />
        </div>
    );
}
