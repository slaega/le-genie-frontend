import { MainLayout } from '@/components/templates/main-layout';
import { InfinitePostsGrid } from '@/components/organisms/infinite-posts-grid';

export const metadata = {
    title: 'Publications — Le Génie',
    description: 'Découvrez toutes les publications de la communauté',
};

export default function PublicationsPage() {
    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Publications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Découvrez les publications de la communauté
                    </p>
                </div>

                <InfinitePostsGrid
                    params={{ status: 'PUBLISHED' }}
                    emptyTitle="Aucune publication"
                    emptyDescription="Soyez le premier à publier sur Le Génie."
                />
            </div>
        </MainLayout>
    );
}
