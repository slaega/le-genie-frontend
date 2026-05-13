'use client';

import { PenSquare, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreatePost } from '@/hooks/mutations/use-create-post';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';

interface MeActionsProps {
    isAdmin?: boolean;
}

export function MeActions({ isAdmin }: MeActionsProps) {
    const { mutateAsync: createPost, isPending } = useCreatePost();
    const router = useRouter();
    const qc = useQueryClient();

    async function handleNewPost() {
        try {
            const post = await createPost();
            router.push(`/post/${post.id}/edit`);
        } catch {
            toast.error('Erreur lors de la création de la publication');
        }
    }

    function handleLogout() {
        qc.clear();
        window.location.href = '/auth/sign-in';
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Button
                size="sm"
                onClick={handleNewPost}
                disabled={isPending}
                className="gap-1.5"
            >
                <PenSquare className="h-3.5 w-3.5" />
                {isPending ? 'Création…' : 'Écrire'}
            </Button>

            {isAdmin && (
                <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href="/admin">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Admin
                    </Link>
                </Button>
            )}

            <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                aria-label="Se déconnecter"
            >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Déconnecter</span>
            </Button>
        </div>
    );
}
