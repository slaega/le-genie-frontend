import type { Metadata } from 'next';
import { BookOpen, Users, Zap } from 'lucide-react';
import { MainLayout } from '@/components/templates/main-layout';

export const metadata: Metadata = {
    title: 'À propos — Le Génie',
    description:
        'Découvrez Le Génie, la plateforme communautaire dédiée au partage de connaissances techniques.',
};

const TEAM = [
    {
        name: 'Sofiane Aïssou',
        role: 'Co-fondateur & CTO',
        avatar: 'SA',
        bio: 'Ingénieur logiciel passionné par les architectures distribuées et le DX.',
    },
    {
        name: 'Lina Ouertatani',
        role: 'Co-fondatrice & Design Lead',
        avatar: 'LO',
        bio: "Designer produit avec 8 ans d'expérience dans les interfaces à forte densité d'information.",
    },
    {
        name: 'Karim Belhadj',
        role: 'Ingénieur Backend',
        avatar: 'KB',
        bio: 'Spécialiste Node.js / NestJS, contributeur open-source et amoureux des API bien designées.',
    },
];

const MISSION = [
    {
        icon: BookOpen,
        title: 'Partager la connaissance',
        description:
            'Rendre la connaissance technique accessible à tous, des débutants aux experts, en français.',
    },
    {
        icon: Users,
        title: 'Construire une communauté',
        description:
            "Fédérer les développeurs, designers et tech-enthousiastes autour d'un espace bienveillant.",
    },
    {
        icon: Zap,
        title: "Accélérer l'apprentissage",
        description:
            'Proposer des contenus structurés et des discussions de qualité pour progresser plus vite.',
    },
];

export default function AboutPage() {
    return (
        <MainLayout>
            {/* Hero */}
            <section className="max-w-3xl mx-auto text-center py-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    À propos de <span className="text-primary">Le Génie</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                    La plateforme communautaire pour partager et découvrir des
                    connaissances techniques en français.
                </p>
                <div className="prose prose-neutral dark:prose-invert mx-auto text-left space-y-4 text-muted-foreground">
                    <p>
                        Le Génie est né d&apos;un constat simple : il manque un
                        espace de qualité, en français, où les développeurs et
                        professionnels du numérique peuvent partager leurs
                        découvertes, leurs retours d&apos;expérience et leurs
                        tutoriels avec une vraie communauté.
                    </p>
                    <p>
                        Notre plateforme permet à chacun de rédiger des articles
                        riches — avec du code, des images, des titres structurés
                        — et de les soumettre à la lecture de milliers de
                        passionnés. Les lecteurs commentent, likent et
                        contribuent pour faire évoluer les publications en temps
                        réel grâce à notre mode collaboratif.
                    </p>
                    <p>
                        Que vous soyez développeur senior souhaitant documenter
                        un pattern avancé, ou étudiant partageant vos premières
                        expériences de projet, Le Génie est fait pour vous.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto py-12 border-t">
                <h2 className="text-2xl font-bold text-center mb-10">
                    Notre mission
                </h2>
                <div className="grid gap-8 sm:grid-cols-3">
                    {MISSION.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="flex flex-col items-center text-center gap-3"
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">{title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="max-w-4xl mx-auto py-12 border-t">
                <h2 className="text-2xl font-bold text-center mb-10">
                    L&apos;équipe
                </h2>
                <div className="grid gap-6 sm:grid-cols-3">
                    {TEAM.map(({ name, role, avatar, bio }) => (
                        <div
                            key={name}
                            className="flex flex-col items-center text-center p-6 rounded-xl border border-border/60 bg-card gap-3"
                        >
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                                {avatar}
                            </div>
                            <div>
                                <p className="font-semibold">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {role}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {bio}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </MainLayout>
    );
}
