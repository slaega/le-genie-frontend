import type { Metadata } from 'next';
import { SiteHeader } from '@/components/organisms/site-header';
import { SiteFooter } from '@/components/templates/site-footer';
import { BlogPage } from '@/components/organisms/blog-page';

export const metadata: Metadata = {
    title: 'Le Blog — Le Génie',
    description:
        'Articles, tutoriels et ressources pour apprendre, partager et progresser ensemble.',
};

export default function PublicationsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
                <BlogPage />
            </main>
            <SiteFooter />
        </div>
    );
}
