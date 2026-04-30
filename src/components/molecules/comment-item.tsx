'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/atoms/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteComment, useUpdateComment } from '@/hooks/mutations/use-comment'
import { toast } from 'sonner'
import type { Comment, User } from '@/lib/api/types'

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUser?: User | null
}

export function CommentItem({ comment, postId, currentUser }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const isAuthor = currentUser?.id === comment.userId
  const { mutateAsync: updateComment, isPending: isUpdating } = useUpdateComment(postId)
  const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteComment(postId)

  async function handleUpdate() {
    if (!editContent.trim()) return
    try {
      await updateComment({ commentId: comment.id, payload: { content: editContent } })
      setIsEditing(false)
      toast.success('Commentaire modifié')
    } catch {
      toast.error('Erreur lors de la modification')
    }
  }

  async function handleDelete() {
    try {
      await deleteComment(comment.id)
      toast.success('Commentaire supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="flex gap-3 py-4 border-b last:border-0">
      <UserAvatar name={comment.user.name} avatarPath={comment.user.avatarPath} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
          </span>
          {comment.refactorAt && (
            <span className="text-xs text-muted-foreground">(modifié)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>

      {isAuthor && !isEditing && (
        <div className="flex items-start gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
