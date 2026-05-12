'use client';

import Link from 'next/link';
import { PostCard, PostCardSkeleton } from '@/components/molecules/post-card';
import { EmptyState } from '@/components/atoms/empty-state';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/hooks/queries/use-posts';
import { useDeletePost } from '@/hooks/mutations/use-delete-post';
import { useCreatePost } from '@/hooks/mutations/use-create-post';
import { useAuth } from '@/providers/auth-provider';
import { BookOpen, PenSquare, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PostsQueryParams } from '@/lib/api/types';
import { postUrl } from '@/lib/post-url';

interface PostsGridProps {
    params?: PostsQueryParams;
    showStatus?: boolean;
    /** When true, shows Edit / Delete action buttons on each card */
    showActions?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
}

export function PostsGrid({
    params,
    showStatus = false,
    showActions = false,
    emptyTitle = 'Aucune publication',
    emptyDescription = "Il n'y a pas encore de publications.",
}: PostsGridProps) {
    const { data, isLoading } = usePosts(params);
    const { isAuthenticated } = useAuth();
    const { mutateAsync: createPost, isPending } = useCreatePost();
    const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePost();
    const router = useRouter();

    async function handleNew() {
        try {
            const post = await createPost();
            router.push(`/post/${post.id}/edit`);
        } catch {
            toast.error('Erreur lors de la création');
        }
    }

    async function handleDelete(id: string, title: string) {
        const confirmed = window.confirm(
            `Supprimer "${title || 'cet article'}" ? Cette action est irréversible.`
        );
        if (!confirmed) return;
        try {
            await deletePost(id);
            toast.success('Publication supprimée');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!data?.items.length) {
        return (
            <EmptyState
                icon={BookOpen}
                title={emptyTitle}
                description={emptyDescription}
                action={
                    isAuthenticated ? (
                        <Button
                            className="gap-2"
                            onClick={handleNew}
                            disabled={isPending}
                        >
                            <PenSquare className="h-4 w-4" />
                            {isPending ? 'Création...' : 'Créer une publication'}
                        </Button>
                    ) : undefined
                }
            />
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((post) => (
                <div key={post.id} className="flex flex-col">
                    <PostCard
                        post={post}
                        href={postUrl(post)}
                        showStatus={showStatus}
                        className="flex-1"
                    />

                    {/* Action bar — edit & delete */}
                    {showActions && (
                        <div className="flex gap-2 mt-2">
                            <Link
                                href={`/post/${post.id}/edit`}
                                className="flex items-center justify-center gap-1.5 flex-1 rounded-lg border border-border bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Pencil className="h-3 w-3" />
                                Modifier
                            </Link>
                            <button
                                onClick={() => handleDelete(post.id, post.title)}
                                disabled={isDeleting}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive/70 hover:text-destructive transition-colors disabled:opacity-50"
                                aria-label="Supprimer"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
