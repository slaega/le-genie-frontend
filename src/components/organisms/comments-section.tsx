'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CommentItem } from '@/components/molecules/comment-item';
import { LoadingSpinner } from '@/components/atoms/loading-spinner';
import { EmptyState } from '@/components/atoms/empty-state';
import { useComments } from '@/hooks/queries/use-comments';
import { useCreateComment } from '@/hooks/mutations/use-comment';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface CommentsSectionProps {
    postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
    const [content, setContent] = useState('');
    const { user, isAuthenticated } = useAuth();
    const { data, isLoading } = useComments(postId);
    const { mutateAsync: createComment, isPending } = useCreateComment(postId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        try {
            await createComment({ content });
            setContent('');
            toast.success('Commentaire ajouté');
        } catch {
            toast.error("Erreur lors de l'ajout du commentaire");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-xl font-semibold">
                    Commentaires
                    {data && data.total > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground font-normal">
                            ({data.total})
                        </span>
                    )}
                </h2>
            </div>

            {isAuthenticated && (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Partagez votre avis..."
                        rows={3}
                    />
                    <Button
                        type="submit"
                        disabled={isPending || !content.trim()}
                        size="sm"
                    >
                        {isPending ? 'Envoi...' : 'Commenter'}
                    </Button>
                </form>
            )}

            <Separator />

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            ) : !data?.items.length ? (
                <EmptyState
                    icon={MessageSquare}
                    title="Aucun commentaire"
                    description="Soyez le premier à commenter cette publication."
                />
            ) : (
                <div>
                    {data.items.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            currentUser={user}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
