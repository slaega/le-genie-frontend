import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/templates/main-layout';

interface Section {
    id: string;
    title: string;
    content: ReactNode;
}

interface LegalPageProps {
    /** Eyebrow shown above the title (e.g. "Politique de confidentialité"). */
    eyebrow: string;
    title: string;
    description: string;
    /** ISO date — last revision. */
    updatedAt: string;
    sections: Section[];
}

/**
 * Shared editorial layout for legal pages (privacy, terms, etc.).
 * Two-column on lg+ : sticky table-of-contents on the left, content on the right.
 * Designed to feel alive — big typography, generous spacing, hoverable nav.
 */
export function LegalPage({
    eyebrow,
    title,
    description,
    updatedAt,
    sections,
}: LegalPageProps) {
    const updated = new Date(updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto">
                {/* ── Page header ───────────────────────────────────── */}
                <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Retour à l&apos;accueil
                    </Link>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-4">
                        {eyebrow}
                    </p>
                    <h1 className="text-[36px] sm:text-[46px] font-bold tracking-tight leading-[1.05] text-foreground">
                        {title}
                    </h1>
                    <p className="text-[14.5px] text-muted-foreground mt-5 leading-relaxed">
                        {description}
                    </p>
                    <p className="text-[12px] text-muted-foreground/70 mt-4">
                        Dernière mise à jour : {updated}
                    </p>
                </div>

                {/* ── Two-column body ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 lg:gap-16">
                    {/* Sticky table of contents */}
                    <aside className="lg:sticky lg:top-24 self-start order-2 lg:order-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">
                            Sommaire
                        </p>
                        <nav className="flex flex-col gap-0.5">
                            {sections.map((section, i) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="group flex items-center gap-2 px-3 py-2 -mx-3 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                >
                                    <span className="text-muted-foreground/40 tabular-nums text-[11px] w-5 shrink-0">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="flex-1 truncate">
                                        {section.title}
                                    </span>
                                    <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Content sections */}
                    <article className="min-w-0 order-1 lg:order-2 space-y-14">
                        {sections.map((section, i) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-24"
                            >
                                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-primary mb-2">
                                    Section {String(i + 1).padStart(2, '0')}
                                </p>
                                <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-foreground mb-5">
                                    {section.title}
                                </h2>
                                <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-foreground/80 prose-li:text-[15px] prose-li:text-foreground/80 prose-strong:text-foreground prose-a:text-primary">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </article>
                </div>

                {/* ── Footer link ───────────────────────────────────── */}
                <div className="mt-20 pt-10 border-t border-border text-center">
                    <p className="text-[13px] text-muted-foreground">
                        Une question ? Écrivez-nous à{' '}
                        <a
                            href="mailto:contact@legenie.app"
                            className="text-primary font-medium hover:underline underline-offset-4"
                        >
                            contact@legenie.app
                        </a>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
