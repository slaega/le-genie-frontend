import { redirect } from 'next/navigation';
import { serverApi } from '@/lib/api/server';
import type { User } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { MainLayout } from '@/components/templates/main-layout';
import { ProfileForm } from '@/components/organisms/profile-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mon profil — Le Génie' };

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
    const { locale } = await params;
    let me: User;

    try {
        me = await serverApi.get<User>('auth/me');
    } catch (err) {
        if (err instanceof ApiError) redirect(`/${locale}/auth/sign-in`);
        throw err;
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/me"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Mon profil
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Modifier le profil
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ces informations sont visibles publiquement sur votre page auteur.
                    </p>
                </div>

                <ProfileForm user={me} />
            </div>
        </MainLayout>
    );
}
