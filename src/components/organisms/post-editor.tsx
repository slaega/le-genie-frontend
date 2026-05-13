'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    ArrowLeft,
    Send,
    Sparkles,
    BookOpen,
    MoreHorizontal,
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

/* ── Word-count helper ───────────────────────────────────────────────────── */

type AnyNode = {
    type?: string;
    text?: string;
    content?: AnyNode[];
};

function countWords(node: AnyNode | null | undefined): number {
    if (!node) return 0;
    if (node.type === 'text' && typeof node.text === 'string') {
        return node.text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (!Array.isArray(node.content)) return 0;
    return node.content.reduce((sum, child) => sum + countWords(child), 0);
}

/* ── Right info panel ────────────────────────────────────────────────────── */

function InfoPanel({ post, wordCount }: { post: Post; wordCount: number }) {
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const target = 800; // ~4 min read — feels "substantial"
    const progress = Math.min(100, Math.round((wordCount / target) * 100));

    return (
        <aside className="w-72 shrink-0 border-l border-border/60 bg-muted/[0.18] overflow-y-auto">
            <div className="p-5 space-y-5">
                {/* ── Hero card — word count gauge ─────────────────────── */}
                <section className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center gap-1.5 mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Statistiques
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <p className="text-[44px] font-bold leading-none tabular-nums text-foreground">
                            {wordCount}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {wordCount === 1 ? 'mot' : 'mots'}
                        </p>

                        {/* Progress bar — opacity encodes progress (no chromatic colors) */}
                        <div className="w-full mt-4 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-foreground transition-all duration-300"
                                style={{
                                    width: `${Math.max(2, progress)}%`,
                                    opacity:
                                        progress < 30
                                            ? 0.35
                                            : progress < 70
                                              ? 0.65
                                              : 1,
                                }}
                            />
                        </div>
                        <p className="text-[10.5px] text-muted-foreground mt-2">
                            {progress < 30
                                ? 'Article court'
                                : progress < 70
                                  ? 'Bonne longueur'
                                  : 'Article complet'}
                        </p>
                    </div>

                    <div className="h-px bg-border/60 my-4" />

                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                            <p className="text-[15px] font-bold tabular-nums text-foreground">
                                {readingMinutes}m
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                Lecture
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[15px] font-bold tabular-nums text-foreground">
                                {post.postTags.length}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {post.postTags.length === 1 ? 'Tag' : 'Tags'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Publication info ─────────────────────────────────── */}
                <section className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        Publication
                    </p>
                    <dl className="space-y-2.5 text-[12.5px]">
                        <Row label="Statut">
                            <StatusBadge status={post.status} />
                        </Row>
                        <Row label="Créé">
                            <span className="text-foreground/80 tabular-nums">
                                {formatDate(post.createdAt)}
                            </span>
                        </Row>
                        <Row label="Modifié">
                            <span className="text-foreground/80 tabular-nums">
                                {formatDate(post.updatedAt)}
                            </span>
                        </Row>
                        {post.scheduledAt && (
                            <Row label="Programmé">
                                <span className="text-foreground font-medium tabular-nums">
                                    {new Date(
                                        post.scheduledAt
                                    ).toLocaleDateString('fr-FR')}
                                </span>
                            </Row>
                        )}
                    </dl>
                </section>

                {/* ── Tags ──────────────────────────────────────────────── */}
                {post.postTags.length > 0 && (
                    <section className="rounded-2xl border border-border bg-background p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                            Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {post.postTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/60 text-foreground/80"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Quick actions ────────────────────────────────────── */}
                <section className="rounded-2xl border border-border bg-background p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        Aperçu public
                    </p>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed mb-3">
                        L&apos;article s&apos;ouvrira dans un nouvel onglet à
                        son URL publique.
                    </p>
                    <Link
                        href={
                            post.slug
                                ? `/post/${post.slug}`
                                : `/post/${post.id}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline underline-offset-4"
                    >
                        <BookOpen className="h-3 w-3" />
                        Voir la publication
                    </Link>
                </section>
            </div>
        </aside>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right">{children}</dd>
        </div>
    );
}

/* ── More-actions dropdown (Archive / Schedule) ──────────────────────────── */

function MoreActionsMenu({
    canArchive,
    canSchedule,
    scheduledAt,
    isSaving,
    onArchive,
    onToggleScheduler,
}: {
    canArchive: boolean;
    canSchedule: boolean;
    scheduledAt: string;
    isSaving: boolean;
    onArchive: () => void;
    onToggleScheduler: () => void;
}) {
    const [open, setOpen] = useState(false);
    if (!canArchive && !canSchedule) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-lg transition-colors',
                    open
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                aria-label="Plus d'actions"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-30 mt-1.5 w-48 rounded-xl border border-border bg-background shadow-lg shadow-black/[0.08] py-1 overflow-hidden">
                        {canSchedule && (
                            <button
                                type="button"
                                onClick={() => {
                                    onToggleScheduler();
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[12px] text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                            >
                                <CalendarClock className="h-3.5 w-3.5" />
                                {scheduledAt
                                    ? 'Modifier la planification'
                                    : 'Programmer la publication'}
                            </button>
                        )}
                        {canArchive && (
                            <button
                                type="button"
                                onClick={() => {
                                    onArchive();
                                    setOpen(false);
                                }}
                                disabled={isSaving}
                                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[12px] text-foreground/80 hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                            >
                                <Archive className="h-3.5 w-3.5" />
                                Archiver
                            </button>
                        )}
                    </div>
                </>
            )}
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
     * but no H1 in `content`. Prepend the title as H1 so the editor can
     * surface it inline — and on save we read it back from there.
     */
    const initialContent = useMemo(
        () => ensureTitleHeading(post.content, post.title),
        [post.content, post.title]
    );

    /* Live word count for the info panel — polls every 1.5s while editor is mounted. */
    const [wordCount, setWordCount] = useState(() =>
        countWords(initialContent as AnyNode)
    );
    useEffect(() => {
        if (!showPanel) return;
        const tick = () => {
            const json = editorRef.current?.getJSON();
            if (json) setWordCount(countWords(json as AnyNode));
        };
        tick();
        const id = setInterval(tick, 1500);
        return () => clearInterval(id);
    }, [showPanel]);

    /** Silent autosave — title is extracted from the first H1 of the content. */
    const autosave = useCallback(
        async (json: Record<string, unknown>) => {
            const title = (editorRef.current?.getTitle() ?? '').trim();
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
            <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/60 bg-background/85 backdrop-blur-md px-4 py-2.5">
                {/* Left: close + status pill */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/me"
                        aria-label="Retour à mon espace"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div className="h-5 w-px bg-border" />

                    <StatusBadge status={post.status} />

                    {scheduledAt && !isPublished && (
                        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-foreground/70 font-medium px-2 py-1 rounded-md bg-muted/60 border border-border">
                            <CalendarClock className="h-3 w-3" />
                            {new Date(scheduledAt).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 ml-auto">
                    <CollaboratorsPanel postId={post.id} />

                    <button
                        type="button"
                        onClick={() => setShowPanel((v) => !v)}
                        className={cn(
                            'h-8 px-2.5 rounded-lg text-[12px] flex items-center gap-1.5 transition-colors',
                            showPanel
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                        aria-pressed={showPanel}
                    >
                        <PanelRight className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                            {showPanel ? 'Masquer infos' : 'Infos'}
                        </span>
                    </button>

                    {isOwner && (
                        <MoreActionsMenu
                            canArchive={post.status !== 'ARCHIVED'}
                            canSchedule={!isPublished}
                            scheduledAt={scheduledAt}
                            isSaving={isSaving}
                            onArchive={() => save('ARCHIVED')}
                            onToggleScheduler={() =>
                                setShowScheduler((v) => !v)
                            }
                        />
                    )}

                    <div className="h-5 w-px bg-border mx-1" />

                    <button
                        type="button"
                        onClick={() => save('DRAFT')}
                        disabled={isSaving || isPublishing}
                        className="h-8 px-3 rounded-lg text-[12px] flex items-center gap-1.5 border border-border text-foreground/80 hover:text-foreground hover:bg-accent transition-all duration-150 disabled:opacity-40"
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
                                'h-8 px-3.5 rounded-lg text-[12px] flex items-center gap-1.5 font-semibold',
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
            </header>

            {/* ── Scheduler strip ─────────────────────────────────────── */}
            {showScheduler && (
                <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5 flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-150">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[12px] font-medium text-foreground/80">
                        Publier automatiquement le
                    </span>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="h-8 rounded-lg border border-border bg-background px-2.5 text-[12px] focus:border-foreground/40 transition-colors"
                    />
                    {scheduledAt && (
                        <button
                            type="button"
                            onClick={() => setScheduledAt('')}
                            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </button>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-auto hidden sm:block">
                        Enregistre en brouillon pour appliquer.
                    </span>
                </div>
            )}

            {/* ── Editor + optional side panel ────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor canvas */}
                <div className="flex-1 overflow-y-auto bg-background">
                    <div className="max-w-[760px] mx-auto px-6 sm:px-10 pt-8 pb-32">
                        {/*
                         * Cover thumbnail — compact horizontal strip so it never
                         * pushes the H1 below the fold. Either a small preview
                         * or a single-line "+ Ajouter une couverture" affordance.
                         */}
                        <label className="group relative block cursor-pointer mb-8">
                            {coverPreview ? (
                                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-muted">
                                    <Image
                                        src={coverPreview}
                                        alt="Couverture"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                                        <span className="text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/55 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Changer la couverture
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-12 rounded-xl border border-dashed border-border bg-transparent flex items-center justify-center gap-2 text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:bg-muted/30 transition-all duration-150 select-none">
                                    <ImageIcon className="h-4 w-4" />
                                    <span className="text-[12.5px] font-medium">
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
                        <div className="mb-5">
                            <TagsInput
                                postId={post.id}
                                initialTags={post.postTags.map((t) => t.name)}
                            />
                        </div>

                        {/* Editor — title is the first H1, body follows */}
                        <BlogEditor
                            defaultContent={initialContent}
                            onAutoSave={autosave}
                            autoSaveInterval={5_000}
                            editorRef={editorRef}
                            className="min-h-[560px]"
                        />
                    </div>
                </div>

                {/* Right info panel */}
                {showPanel && <InfoPanel post={post} wordCount={wordCount} />}
            </div>
        </div>
    );
}
