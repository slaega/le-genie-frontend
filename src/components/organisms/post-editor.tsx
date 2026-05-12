'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, EyeOff, Archive, CalendarClock, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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

    /**
     * Silent autosave triggered by BlogEditor (debounced 5s after the last edit).
     * Only persists drafts — never auto-publishes. Skips empty titles.
     */
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
                        // Keep the current status — autosave never changes DRAFT → PUBLISHED
                        status: post.status === 'EMPTY' ? 'DRAFT' : post.status,
                    },
                });
            } catch {
                // silent — autosave failures are surfaced by the next manual save
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
                        // Pass scheduledAt only when saving a draft (not when publishing directly)
                        // Pass scheduledAt only when saving as DRAFT with a schedule.
                        // When publishing, omit it — the backend auto-clears scheduledAt.
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
                          ? `Publication programmée pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`
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

    return (
        <div className="flex flex-col h-full bg-background">
            {/* ── Toolbar ──────────────────────────────────────────────── */}
            <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-2.5">
                <StatusBadge status={post.status} />

                <div className="flex items-center gap-1.5 ml-auto">
                    <CollaboratorsPanel postId={post.id} />

                    {isOwner && post.status !== 'ARCHIVED' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-muted-foreground"
                            onClick={() => save('ARCHIVED')}
                            disabled={isSaving}
                        >
                            <Archive className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Archiver</span>
                        </Button>
                    )}

                    {isOwner && post.status !== 'PUBLISHED' && (
                        <button
                            type="button"
                            onClick={() => setShowScheduler((v) => !v)}
                            disabled={isSaving}
                            title="Programmer la publication"
                            className={cn(
                                'h-8 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
                                showScheduler
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => save('DRAFT')}
                        disabled={isSaving || isPublishing}
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Sauvegarde…' : 'Brouillon'}
                    </Button>

                    {isOwner && (
                        <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                                save(post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                            }
                            disabled={isSaving || isPublishing}
                        >
                            {post.status === 'PUBLISHED' ? (
                                <><EyeOff className="h-3.5 w-3.5" /> Dépublier</>
                            ) : (
                                <><Eye className="h-3.5 w-3.5" /> Publier</>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Scheduler strip ──────────────────────────────────────── */}
            {showScheduler && (
                <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-150">
                    <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">
                        Publier automatiquement le :
                    </span>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="h-8 rounded-lg border border-border bg-background px-2 text-sm focus:border-foreground/30 transition-colors"
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
                    <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
                        Enregistrez en brouillon pour appliquer.
                    </span>
                </div>
            )}

            {/* ── Editor body ──────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

                    {/* Cover image */}
                    <div
                        className={cn(
                            'group relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer',
                            'border border-dashed border-border hover:border-foreground/30 transition-colors',
                            'bg-muted/30',
                            coverPreview && 'border-solid border-transparent'
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground select-none">
                                <span className="text-sm font-medium">Image de couverture</span>
                                <span className="text-xs opacity-60">Cliquer pour choisir</span>
                            </div>
                        )}
                        {coverPreview && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Changer la couverture
                                </span>
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

                    {/* Title */}
                    <div>
                        <input
                            {...register('title')}
                            placeholder="Titre de la publication…"
                            className={cn(
                                'w-full bg-transparent text-3xl font-bold text-foreground',
                                'border-0 border-b border-border focus:border-foreground/30',
                                'rounded-none px-0 pb-3 transition-colors',
                                'placeholder:text-muted-foreground/30',
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
                        className="min-h-[500px]"
                    />
                </div>
            </div>
        </div>
    );
}
