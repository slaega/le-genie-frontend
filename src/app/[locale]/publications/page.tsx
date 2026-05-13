import type { Metadata } from 'next';
import { SiteHeader } from '@/components/organisms/site-header';
import { SiteFooter } from '@/components/templates/site-footer';
import { BlogPage, type CmsTag } from '@/components/organisms/blog-page';
import { serverApi } from '@/lib/api/server';

export const metadata: Metadata = {
    title: 'Le Blog — Le Génie',
    description:
        'Articles, tutoriels et ressources pour apprendre, partager et progresser ensemble.',
};

export default async function PublicationsPage() {
    /* Fetch tags server-side so the category sidebar has data without a
     * client waterfall. Falls back to empty list on error. */
    let allTags: CmsTag[] = [];
    try {
        const res = await serverApi.get<{ items: CmsTag[] }>('/cms/tags');
        allTags = res.items.slice(0, 20);
    } catch {
        // silently degrade — sidebar just won't show categories
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-24">
                    {/* Page heading — Slothui style: centered, plain-text eyebrow */}
                    <div className="text-center mb-14">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-5">
                            Le Blog
                        </p>
                        <h1 className="text-[38px] sm:text-[48px] font-bold tracking-tight leading-[1.05] text-foreground">
                            Parcourir les ressources
                        </h1>
                        <p className="text-[14.5px] text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
                            Articles, tutoriels et ressources rédigés par notre
                            communauté.
                        </p>
                    </div>

                    <BlogPage allTags={allTags} />
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
