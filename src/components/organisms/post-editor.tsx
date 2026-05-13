'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Eye,
    EyeOff,
    Archive,
    CalendarClock,
    X,
    ImageIcon,
    Save,
    PanelRight,
    FileText,
    Clock,
    Hash,
} from 'lucide-react';
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
import { cn, formatDate } from '@/lib/utils';

const schema = z.object({
    title: z.string().min(1, 'Le titre est requis').max(255),
});

type FormValues = z.infer<typeof schema>;

interface PostEditorProps {
    post: Post;
    isOwner: boolean;
}

/* ── Right stats panel ───────────────────────────────────────────────────── */

function StatsPanel({ post }: { post: Post }) {
    return (
        <aside className="w-64 shrink-0 border-l border-border/50 bg-background/60 overflow-y-auto">
            <div className="p-5 space-y-6">
                {/* Publication info */}
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
                        Publication
                    </p>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="text-muted-foreground/60">
                                Statut
                            </span>
                            <StatusBadge status={post.status} />
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="text-muted-foreground/60">
                                Créé le
                            </span>
                            <span className="text-foreground/80">
                                {formatDate(post.createdAt)}
                            </span>
                        </div>
                        {post.scheduledAt && (
                            <div className="flex items-center justify-between text-[12px]">
                                <span className="text-muted-foreground/60">
                                    Programmé
                                </span>
                                <span className="text-amber-500/80 text-[11px]">
                                    {new Date(
                                        post.scheduledAt
                                    ).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Writing stats */}
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
                        Rédaction
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-foreground">
                                    {post.readingTime > 0
                                        ? `${post.readingTime} min`
                                        : '—'}
                                </p>
                                <p className="text-[10px] text-muted-foreground/50">
                                    Lecture estimée
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-foreground">
                                    {post.postTags.length}
                                </p>
                                <p className="text-[10px] text-muted-foreground/50">
                                    {post.postTags.length === 1
                                        ? 'Tag'
                                        : 'Tags'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-foreground">
                                    {post.commentsCount}
                                </p>
                                <p className="text-[10px] text-muted-foreground/50">
                                    Commentaires
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags preview */}
                {post.postTags.length > 0 && (
                    <>
                        <div className="h-px bg-border/50" />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {post.postTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] bg-muted/60 border border-border/50 text-muted-foreground"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}

/* ── PostEditor ──────────────────────────────────────────────────────────── */

export function PostEditor({ post, isOwner }: PostEditorProps) {
    const editorRef = useRef<BlogEditorRef>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(
        post.imagePath
    );
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [showScheduler, setShowScheduler] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
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
     * Silent autosave — blob images are stripped by BlogEditor before the JSON
     * reaches here, so the draft never contains browser-local URLs.
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
                        status: post.status === 'EMPTY' ? 'DRAFT' : post.status,
                    },
                });
            } catch {
                // silent — failures are surfaced on next manual save
            }
        },
        [getValues, updatePost, post.id, post.status]
    );

    /**
     * Manual save:
     * 1. Flush any pending blob images → uploads to S3, replaces src in editor.
     * 2. Persist the resolved content + metadata.
     */
    async function save(status: PostStatus) {
        await handleSubmit(async ({ title }) => {
            try {
                const json = await editorRef.current?.flushImages(
                    async (file) => {
                        const { url } = await postsApi.uploadImage(
                            post.id,
                            file
                        );
                        return url;
                    }
                );

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
            } catch (err) {
                const msg = err instanceof Error ? err.message : '';
                toast.error(
                    msg.startsWith('Upload failed')
                        ? "Erreur lors de l'upload d'une image — réessayez."
                        : "Erreur lors de l'enregistrement"
                );
            }
        })();
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
            <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-border/50 bg-background/90 backdrop-blur-sm px-4 py-2">
                <StatusBadge status={post.status} />

                <div className="flex items-center gap-1.5 ml-auto">
                    <CollaboratorsPanel postId={post.id} />

                    {/* Stats panel toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPanel((v) => !v)}
                        className={cn(
                            'h-8 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors',
                            showPanel
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                    >
                        <PanelRight className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Infos</span>
                    </button>

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
                                    ? new Date(scheduledAt).toLocaleDateString(
                                          'fr-FR'
                                      )
                                    : 'Programmer'}
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => save('DRAFT')}
                        disabled={isSaving || isPublishing}
                        className="h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 disabled:opacity-40"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Sauvegarde…' : 'Brouillon'}
                    </button>

                    {isOwner && (
                        <button
                            type="button"
                            onClick={() =>
                                save(isPublished ? 'DRAFT' : 'PUBLISHED')
                            }
                            disabled={isSaving || isPublishing}
                            className={cn(
                                'h-8 px-3.5 rounded-lg text-xs flex items-center gap-1.5 font-medium',
                                'transition-all duration-150 disabled:opacity-40',
                                isPublished
                                    ? 'bg-muted text-foreground hover:bg-accent border border-border'
                                    : 'bg-foreground text-background hover:opacity-90'
                            )}
                        >
                            {isPublished ? (
                                <>
                                    <EyeOff className="h-3.5 w-3.5" /> Dépublier
                                </>
                            ) : (
                                <>
                                    <Eye className="h-3.5 w-3.5" /> Publier
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Scheduler strip ─────────────────────────────────────── */}
            {showScheduler && (
                <div className="border-b border-border/50 bg-muted/20 px-4 py-2 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-150">
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
                    <span className="text-xs text-muted-foreground/40 ml-auto hidden sm:block">
                        Enregistrez en brouillon pour appliquer.
                    </span>
                </div>
            )}

            {/* ── Editor + optional side panel ────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor canvas */}
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
                                <div className="w-full aspect-video rounded-xl border border-dashed border-border/40 bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/30 group-hover:border-border/60 group-hover:text-muted-foreground/50 transition-all duration-200 select-none">
                                    <ImageIcon className="h-5 w-5" />
                                    <span className="text-xs">
                                        Ajouter une image de couverture
                                    </span>
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
                                    'placeholder:text-muted-foreground/15'
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
                            onAutoSave={autosave}
                            autoSaveInterval={5_000}
                            editorRef={editorRef}
                            className="min-h-[400px]"
                        />
                    </div>
                </div>

                {/* Right stats panel */}
                {showPanel && <StatsPanel post={post} />}
            </div>
        </div>
    );
}
