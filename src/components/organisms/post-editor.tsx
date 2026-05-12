'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Archive, CalendarClock, X, ImageIcon, Save } from 'lucide-react';
import Image from 'next/image';
import {
    BlogEditor,
    type BlogEditorRef,
} from '@/components/editor/blog-editor';
import { CollaboratorsPanel } from '@/components/organisms/collaborators-panel';
import { TagsInput } from '@/components/molecules/tags-input';
import { StatusBadge } from '@/components/atoms/status-badge';
import { useUpdatePost } from '@/hooks/mutations/use-update-post';
import { usePublishPost } from '@/hooks/mutations/use-publish-post';
import { postsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Post, PostStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const schema = z.object({
    title: z.string().min(1, 'Le titre est requis').max(255),
});

type FormValues = z.infer<typeof schema>;

interface PostEditorProps {
    post: Post;
    isOwner: boolean;
}

export function PostEditor({ post, isOwner }: PostEditorProps) {
    const editorRef = useRef<BlogEditorRef>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(
        post.imagePath
    );
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [showScheduler, setShowScheduler] = useState(false);
    const [scheduledAt, setScheduledAt] = useState<string>(
        post.scheduledAt
            ? new Date(post.scheduledAt).toISOString().slice(0, 16)
            : ''
    );
    const { mutateAsync: updatePost, isPending: isSaving } = useUpdatePost();
    const { isPending: isPublishing } = usePublishPost();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: post.title },
    });

    const autosave = useCallback(
        async (json: Record<string, unknown>) => {
            const title = getValues('title')?.trim();
            if (!title) return;
            try {
                await updatePost({
                    id: post.id,
                    payload: {
                        title,
                        content: json,
                        status: post.status === 'EMPTY' ? 'DRAFT' : post.status,
                    },
                });
            } catch {
                // silent autosave
            }
        },
        [getValues, updatePost, post.id, post.status]
    );

    async function save(status: PostStatus) {
        const json = editorRef.current?.getJSON();
        await handleSubmit(async ({ title }) => {
            try {
                await updatePost({
                    id: post.id,
                    payload: {
                        title,
                        content: json ?? undefined,
                        status,
                        scheduledAt:
                            status === 'DRAFT' && scheduledAt
                                ? new Date(scheduledAt).toISOString()
                                : undefined,
                    },
                    cover: coverFile ?? undefined,
                });
                toast.success(
                    status === 'PUBLISHED'
                        ? 'Publication publiée !'
                        : scheduledAt && status === 'DRAFT'
                          ? `Programmée pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`
                          : 'Brouillon enregistré'
                );
            } catch {
                toast.error("Erreur lors de l'enregistrement");
            }
        })();
    }

    async function handleImageUpload(file: File): Promise<string | null> {
        try {
            const { url } = await postsApi.uploadImage(post.id, file);
            return url;
        } catch {
            toast.error("Erreur lors de l'upload de l'image");
            return null;
        }
    }

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }

    const isPublished = post.status === 'PUBLISHED';

    return (
        <div className="flex flex-col h-full bg-background">

            {/* ── Top action bar ──────────────────────────────────────── */}
            <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-border/60 bg-background/90 backdrop-blur-sm px-4 py-2">
                <StatusBadge status={post.status} />

                <div className="flex items-center gap-1.5 ml-auto">
                    <CollaboratorsPanel postId={post.id} />

                    {isOwner && post.status !== 'ARCHIVED' && (
                        <button
                            type="button"
                            onClick={() => save('ARCHIVED')}
                            disabled={isSaving}
                            className="h-8 px-2.5 rounded-lg text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <Archive className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Archiver</span>
                        </button>
                    )}

                    {isOwner && !isPublished && (
                        <button
                            type="button"
                            onClick={() => setShowScheduler((v) => !v)}
                            disabled={isSaving}
                            className={cn(
                                'h-8 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
                                showScheduler
                                    ? 'bg-accent text-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                        >
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                {scheduledAt
                                    ? new Date(scheduledAt).toLocaleDateString('fr-FR')
                                    : 'Programmer'}
                            </span>
                        </button>
                    )}

                    {/* Save draft */}
                    <button
                        type="button"
                        onClick={() => save('DRAFT')}
                        disabled={isSaving || isPublishing}
                        className="h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 disabled:opacity-40"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Sauvegarde…' : 'Brouillon'}
                    </button>

                    {/* Publish / Unpublish */}
                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => save(isPublished ? 'DRAFT' : 'PUBLISHED')}
                            disabled={isSaving || isPublishing}
                            className={cn(
                                'h-8 px-3.5 rounded-lg text-xs flex items-center gap-1.5 font-medium',
                                'transition-all duration-150 disabled:opacity-40',
                                isPublished
                                    ? 'bg-muted text-foreground hover:bg-accent border border-border'
                                    : 'bg-foreground text-background hover:opacity-90',
                            )}
                        >
                            {isPublished ? (
                                <><EyeOff className="h-3.5 w-3.5" /> Dépublier</>
                            ) : (
                                <><Eye className="h-3.5 w-3.5" /> Publier</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Scheduler strip ─────────────────────────────────────── */}
            {showScheduler && (
                <div className="border-b border-border/60 bg-muted/20 px-4 py-2 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-150">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                        Publier automatiquement le :
                    </span>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="h-7 rounded-lg border border-border bg-background px-2 text-xs focus:border-foreground/30 transition-colors"
                    />
                    {scheduledAt && (
                        <button
                            type="button"
                            onClick={() => setScheduledAt('')}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </button>
                    )}
                    <span className="text-xs text-muted-foreground/50 ml-auto hidden sm:block">
                        Enregistrez en brouillon pour appliquer.
                    </span>
                </div>
            )}

            {/* ── Editor canvas ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 pt-10 pb-24 space-y-6">

                    {/* Cover image */}
                    <label className="group relative block cursor-pointer">
                        {coverPreview ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                <Image
                                    src={coverPreview}
                                    alt="Couverture"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Changer la couverture
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-video rounded-xl border border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center gap-2 text-muted-foreground/40 group-hover:border-border group-hover:text-muted-foreground/60 transition-all duration-200 select-none">
                                <ImageIcon className="h-6 w-6" />
                                <span className="text-xs">Ajouter une image de couverture</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleCoverChange}
                        />
                    </label>

                    {/* Title */}
                    <div>
                        <input
                            {...register('title')}
                            placeholder="Titre de la publication…"
                            className={cn(
                                'w-full bg-transparent text-[2rem] sm:text-[2.5rem] font-bold text-foreground',
                                'border-0 focus:outline-none',
                                'rounded-none px-0 py-2 leading-tight',
                                'placeholder:text-muted-foreground/20',
                            )}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive mt-1.5">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Tags */}
                    <TagsInput
                        postId={post.id}
                        initialTags={post.postTags.map((t) => t.name)}
                    />

                    {/* Editor */}
                    <BlogEditor
                        defaultContent={post.content}
                        onImageUpload={handleImageUpload}
                        onAutoSave={autosave}
                        autoSaveInterval={5_000}
                        editorRef={editorRef}
                        className="min-h-[400px]"
                    />
                </div>
            </div>
        </div>
    );
}
