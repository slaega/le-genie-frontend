'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, EyeOff, Archive } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BlogEditor, type BlogEditorRef } from '@/components/editor/blog-editor'
import { CollaboratorsPanel } from '@/components/organisms/collaborators-panel'
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
  const { mutateAsync: updatePost, isPending: isSaving } = useUpdatePost()
  const { isPending: isPublishing } = usePublishPost()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: post.title },
  })

  async function save(status: PostStatus) {
    const json = editorRef.current?.getJSON()
    await handleSubmit(async ({ title }) => {
      try {
        await updatePost({
          id: post.id,
          payload: { title, content: json ?? undefined, status },
          cover: coverFile ?? undefined,
        })
        toast.success(
          status === 'PUBLISHED' ? 'Publication publiée !' : 'Brouillon enregistré',
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

          <BlogEditor
            defaultContent={post.content}
            onImageUpload={handleImageUpload}
            editorRef={editorRef}
            className="min-h-[500px]"
          />
        </div>
      </div>
    </div>
  )
}
