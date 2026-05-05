'use client'

import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, EyeOff, Archive, CalendarClock, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BlogEditor, type BlogEditorRef } from '@/components/editor/blog-editor'
import { CollaboratorsPanel } from '@/components/organisms/collaborators-panel'
import { TagsInput } from '@/components/molecules/tags-input'
import { StatusBadge } from '@/components/atoms/status-badge'
import { useUpdatePost } from '@/hooks/mutations/use-update-post'
import { usePublishPost } from '@/hooks/mutations/use-publish-post'
import { postsApi } from '@/lib/api'
import { toast } from 'sonner'
import type { Post, PostStatus } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
})

type FormValues = z.infer<typeof schema>

interface PostEditorProps {
  post: Post
  isOwner: boolean
}

export function PostEditor({ post, isOwner }: PostEditorProps) {
  const editorRef = useRef<BlogEditorRef>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(post.imagePath)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<string>(
    post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ''
  )
  const { mutateAsync: updatePost, isPending: isSaving } = useUpdatePost()
  const { isPending: isPublishing } = usePublishPost()

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: post.title },
  })

  /**
   * Silent autosave triggered by BlogEditor (debounced 5s after the last edit).
   * Only persists drafts — never auto-publishes. Skips empty titles.
   */
  const autosave = useCallback(
    async (json: Record<string, unknown>) => {
      const title = getValues('title')?.trim()
      if (!title) return
      try {
        await updatePost({
          id: post.id,
          payload: {
            title,
            content: json,
            // Keep the current status — autosave never changes DRAFT → PUBLISHED
            status: post.status === 'EMPTY' ? 'DRAFT' : post.status,
          },
        })
      } catch {
        // silent — autosave failures are surfaced by the next manual save
      }
    },
    [getValues, updatePost, post.id, post.status],
  )

  async function save(status: PostStatus) {
    const json = editorRef.current?.getJSON()
    await handleSubmit(async ({ title }) => {
      try {
        await updatePost({
          id: post.id,
          payload: {
            title,
            content: json ?? undefined,
            status,
            // Pass scheduledAt only when saving a draft (not when publishing directly)
            scheduledAt:
              status === 'DRAFT' && scheduledAt
                ? new Date(scheduledAt).toISOString()
                : status === 'PUBLISHED'
                  ? null // clear schedule when manually publishing
                  : undefined,
          },
          cover: coverFile ?? undefined,
        })
        toast.success(
          status === 'PUBLISHED'
            ? 'Publication publiée !'
            : scheduledAt && status === 'DRAFT'
              ? `Publication programmée pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`
              : 'Brouillon enregistré',
        )
      } catch {
        toast.error("Erreur lors de l'enregistrement")
      }
    })()
  }

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      const { url } = await postsApi.uploadImage(post.id, file)
      return url
    } catch {
      toast.error("Erreur lors de l'upload de l'image")
      return null
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b px-4 py-3 bg-background sticky top-14 z-10">
        <StatusBadge status={post.status} />
        <div className="flex items-center gap-2 ml-auto">
          <CollaboratorsPanel postId={post.id} />
          {isOwner && post.status !== 'ARCHIVED' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2"
              onClick={() => save('ARCHIVED')}
              disabled={isSaving}
            >
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => save('DRAFT')}
            disabled={isSaving || isPublishing}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Brouillon'}
          </Button>
          {isOwner && post.status !== 'PUBLISHED' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowScheduler((v) => !v)}
              disabled={isSaving}
              title="Programmer la publication"
            >
              <CalendarClock className="h-4 w-4" />
              {scheduledAt ? new Date(scheduledAt).toLocaleDateString('fr-FR') : 'Programmer'}
            </Button>
          )}
          {isOwner && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => save(post.status === 'PUBLISHED' ? 'PUBLISHED' : 'PUBLISHED')}
              disabled={isSaving || isPublishing}
            >
              {post.status === 'PUBLISHED' ? (
                <><EyeOff className="h-4 w-4" /> Dépublier</>
              ) : (
                <><Eye className="h-4 w-4" /> Publier</>
              )}
            </Button>
          )}
        </div>
      </div>

      {showScheduler && (
        <div className="border-b bg-muted/30 px-4 py-3 flex items-center gap-3 flex-wrap">
          <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Publier automatiquement le :</span>
          <Input
            type="datetime-local"
            value={scheduledAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-auto h-8 text-sm"
          />
          {scheduledAt && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => setScheduledAt('')}
            >
              <X className="h-3.5 w-3.5" />
              Annuler la programmation
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            Enregistrez en brouillon pour appliquer la programmation.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div>
            <Label htmlFor="cover" className="block mb-2 text-sm font-medium">
              Image de couverture
            </Label>
            <div
              className={cn(
                'relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed cursor-pointer',
                'hover:border-primary/50 transition-colors bg-muted/30',
                coverPreview && 'border-0',
              )}
            >
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Couverture"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <span className="text-sm">Cliquer pour ajouter une couverture</span>
                </div>
              )}
              <input
                id="cover"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          <div>
            <Input
              {...register('title')}
              placeholder="Titre de la publication..."
              className={cn(
                'text-3xl font-bold border-0 border-b rounded-none px-0 h-auto py-2',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                'placeholder:text-muted-foreground/40',
              )}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <TagsInput
            postId={post.id}
            initialTags={post.postTags.map((t) => t.name)}
          />

          <BlogEditor
            defaultContent={post.content}
            onImageUpload={handleImageUpload}
            onAutoSave={autosave}
            autoSaveInterval={5_000}
            editorRef={editorRef}
            className="min-h-[500px]"
          />
        </div>
      </div>
    </div>
  )
}
