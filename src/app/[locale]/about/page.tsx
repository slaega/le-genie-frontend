import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Globe, Lightbulb, Users } from 'lucide-react';
import { MainLayout } from '@/components/templates/main-layout';

export const metadata: Metadata = {
    title: 'À propos — Le Génie',
    description:
        'Le Génie, une plateforme créée par Seba Gedeon Matsoula Malonga pour partager la connaissance avec tous.',
};

const VALUES = [
    {
        icon: BookOpen,
        title: 'Partager librement',
        description:
            'La connaissance a plus de valeur quand elle circule. Le Génie est un espace ouvert où chacun peut apprendre et enseigner.',
    },
    {
        icon: Users,
        title: 'Pour tout le monde',
        description:
            "Développeurs, designers, entrepreneurs, curieux : le blog n'est pas réservé aux techniciens. Si vous avez quelque chose à dire, cet espace est pour vous.",
    },
    {
        icon: Lightbulb,
        title: 'Qualité avant quantité',
        description:
            'Des articles pensés, bien écrits, utiles. Pas de contenu jetable — chaque publication doit apporter quelque chose de concret.',
    },
    {
        icon: Globe,
        title: 'Ancré dans la réalité',
        description:
            "Les sujets abordés viennent du terrain : des projets réels, des erreurs vécues, des solutions testées. Pas de théorie creuse.",
    },
];

export default function AboutPage() {
    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-20 py-8">
                {/* ── Hero ───────────────────────────────────────────────── */}
                <section className="space-y-8">
                    <div className="flex items-center gap-6">
                        {/* Avatar initiales */}
                        <div className="h-24 w-24 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary select-none">
                            SG
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Seba Gedeon Matsoula Malonga
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Créateur de Le Génie · Développeur &amp; passionné de partage
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            Bonjour, je suis Seba Gedeon — développeur et créateur de{' '}
                            <strong className="text-foreground">Le Génie</strong>. Cette
                            plateforme est née d&apos;une idée simple : tout le monde a
                            quelque chose à apprendre aux autres, et la meilleure façon
                            de progresser c&apos;est de partager ce qu&apos;on sait.
                        </p>
                        <p>
                            J&apos;ai construit Le Génie parce que je n&apos;avais pas
                            trouvé l&apos;espace qui correspond à ma vision : un blog
                            collaboratif, accessible à tous, sans barrière technique.
                            Un endroit où un développeur peut publier un tutoriel avancé
                            à côté d&apos;un entrepreneur qui partage son retour
                            d&apos;expérience sur son premier projet.
                        </p>
                        <p>
                            La plateforme est pensée pour être <em>vivante</em> : vous
                            pouvez écrire, collaborer en temps réel avec d&apos;autres
                            auteurs, recevoir des retours de la communauté et faire
                            évoluer vos publications au fil du temps.
                        </p>
                    </div>
                </section>

                {/* ── Divider ────────────────────────────────────────────── */}
                <div className="h-px bg-border" />

                {/* ── Values ─────────────────────────────────────────────── */}
                <section className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold">Ce en quoi je crois</h2>
                        <p className="text-muted-foreground mt-2">
                            Ces valeurs ont guidé chaque décision dans la conception de
                            Le Génie.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2">
                        {VALUES.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Divider ────────────────────────────────────────────── */}
                <div className="h-px bg-border" />

                {/* ── CTA ────────────────────────────────────────────────── */}
                <section className="text-center space-y-4 pb-8">
                    <h2 className="text-2xl font-bold">
                        Rejoignez l&apos;aventure
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Créez un compte, écrivez votre premier article et faites
                        partie d&apos;une communauté qui valorise le partage réel.
                    </p>
                    <Link
                        href="/auth/sign-in"
                        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Commencer à écrire
                    </Link>
                </section>
            </div>
        </MainLayout>
    );
}
