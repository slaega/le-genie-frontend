'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
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
    ArrowLeft,
    Send,
} from 'lucide-react';
import {
    BlogEditor,
    type BlogEditorRef,
    ensureTitleHeading,
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

interface PostEditorProps {
    post: Post;
    isOwner: boolean;
}

/* ── Right info panel ────────────────────────────────────────────────────── */

function InfoPanel({ post }: { post: Post }) {
    return (
        <aside className="w-72 shrink-0 border-l border-border/60 bg-muted/[0.15] overflow-y-auto">
            <div className="p-6 space-y-7">
                {/* Publication */}
                <section>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        Publication
                    </p>
                    <dl className="space-y-2.5 text-[12.5px]">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">Statut</dt>
                            <dd>
                                <StatusBadge status={post.status} />
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">Créé le</dt>
                            <dd className="text-foreground/80 tabular-nums">
                                {formatDate(post.createdAt)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">Modifié</dt>
                            <dd className="text-foreground/80 tabular-nums">
                                {formatDate(post.updatedAt)}
                            </dd>
                        </div>
                        {post.scheduledAt && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Programmé
                                </dt>
                                <dd className="text-amber-600 font-medium tabular-nums">
                                    {new Date(
                                        post.scheduledAt
                                    ).toLocaleDateString('fr-FR')}
                                </dd>
                            </div>
                        )}
                    </dl>
                </section>

                <div className="h-px bg-border/60" />

                {/* Rédaction stats */}
                <section>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        Rédaction
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <StatTile
                            icon={Clock}
                            value={
                                post.readingTime > 0
                                    ? `${post.readingTime}m`
                                    : '—'
                            }
                            label="Lecture"
                        />
                        <StatTile
                            icon={Hash}
                            value={post.postTags.length}
                            label={post.postTags.length === 1 ? 'Tag' : 'Tags'}
                        />
                        <StatTile
                            icon={FileText}
                            value={post.commentsCount}
                            label={
                                post.commentsCount === 1
                                    ? 'Commentaire'
                                    : 'Commentaires'
                            }
                        />
                    </div>
                </section>

                {post.postTags.length > 0 && (
                    <>
                        <div className="h-px bg-border/60" />
                        <section>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {post.postTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] bg-background border border-border text-foreground/70"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </aside>
    );
}

function StatTile({
    icon: Icon,
    value,
    label,
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: string | number;
    label: string;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-background px-3 py-2.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
            <p className="text-[15px] font-bold text-foreground leading-none tabular-nums">
                {value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
                {label}
            </p>
        </div>
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

    /**
     * Initial editor content: legacy posts may have a title stored separately
     * but no H1 in `content`. We prepend the title as H1 so the editor can
     * surface it inline — and on save we read it back from there.
     */
    const initialContent = useMemo(
        () => ensureTitleHeading(post.content, post.title),
        [post.content, post.title]
    );

    /** Silent autosave — title is extracted from the first H1 of the content. */
    const autosave = useCallback(
        async (json: Record<string, unknown>) => {
            const title = (editorRef.current?.getTitle() ?? '').trim();
            // Refuse to autosave an empty title — would clobber the post header.
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
                // silent — surfaced on next manual save
            }
        },
        [updatePost, post.id, post.status]
    );

    /**
     * Manual save:
     *   1. Flush any pending blob images → uploads to S3, replaces src in editor.
     *   2. Pull the title from the first H1.
     *   3. Persist the resolved content + metadata.
     */
    async function save(status: PostStatus) {
        const title = (editorRef.current?.getTitle() ?? '').trim();
        if (!title) {
            toast.error(
                'Ajoute un titre — la première ligne en H1 sert de titre.'
            );
            return;
        }

        try {
            const json = await editorRef.current?.flushImages(async (file) => {
                const { url } = await postsApi.uploadImage(post.id, file);
                return url;
            });

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
            <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/60 bg-background/85 backdrop-blur-md px-4 py-2.5">
                <Link
                    href="/me"
                    aria-label="Retour"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                <StatusBadge status={post.status} />

                <div className="flex items-center gap-1.5 ml-auto">
                    <CollaboratorsPanel postId={post.id} />

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
                        className="h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 border border-border text-foreground/80 hover:text-foreground hover:bg-accent transition-all duration-150 disabled:opacity-40"
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
                                'h-8 px-3.5 rounded-lg text-xs flex items-center gap-1.5 font-semibold',
                                'transition-all duration-150 disabled:opacity-40',
                                isPublished
                                    ? 'bg-muted text-foreground hover:bg-accent border border-border'
                                    : 'bg-foreground text-background hover:opacity-90 shadow-sm'
                            )}
                        >
                            {isPublished ? (
                                <>
                                    <EyeOff className="h-3.5 w-3.5" /> Dépublier
                                </>
                            ) : (
                                <>
                                    <Send className="h-3.5 w-3.5" /> Publier
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Scheduler strip ─────────────────────────────────────── */}
            {showScheduler && (
                <div className="border-b border-border/60 bg-muted/20 px-4 py-2.5 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-150">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                        Publier automatiquement le :
                    </span>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="h-7 rounded-lg border border-border bg-background px-2 text-xs focus:border-foreground/40 transition-colors"
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
                    <span className="text-xs text-muted-foreground/60 ml-auto hidden sm:block">
                        Enregistrez en brouillon pour appliquer.
                    </span>
                </div>
            )}

            {/* ── Editor + optional side panel ────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor canvas */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[720px] mx-auto px-6 pt-8 pb-32 space-y-5">
                        {/* Cover image */}
                        <label className="group relative block cursor-pointer">
                            {coverPreview ? (
                                <div className="relative w-full aspect-[2.4/1] rounded-2xl overflow-hidden bg-muted">
                                    <Image
                                        src={coverPreview}
                                        alt="Couverture"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Changer la couverture
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full aspect-[2.4/1] rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground/60 group-hover:border-foreground/30 group-hover:text-foreground/70 transition-all duration-200 select-none">
                                    <ImageIcon className="h-5 w-5" />
                                    <span className="text-xs font-medium">
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

                        {/* Tags */}
                        <TagsInput
                            postId={post.id}
                            initialTags={post.postTags.map((t) => t.name)}
                        />

                        {/* Editor — title is the first H1, body follows */}
                        <BlogEditor
                            defaultContent={initialContent}
                            onAutoSave={autosave}
                            autoSaveInterval={5_000}
                            editorRef={editorRef}
                            className="min-h-[480px]"
                        />
                    </div>
                </div>

                {/* Right info panel */}
                {showPanel && <InfoPanel post={post} />}
            </div>
        </div>
    );
}
