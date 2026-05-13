'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code2,
    Link2,
    Image as ImageIcon,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Undo,
    Redo,
    Minus,
    Code,
    ChevronDown,
    Type,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
    editor: Editor;
    onImageUpload?: (file: File) => Promise<string | null>;
}

/* ── Icon button ─────────────────────────────────────────────────────────── */

function ToolBtn({
    label,
    onClick,
    active,
    disabled,
    children,
    shortcut,
}: {
    label: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    shortcut?: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={label}
                    aria-pressed={active}
                    className={cn(
                        'h-7 w-7 flex items-center justify-center rounded-md transition-all duration-100',
                        'text-muted-foreground hover:text-foreground hover:bg-accent',
                        active && 'text-foreground bg-accent',
                        disabled && 'opacity-25 cursor-not-allowed pointer-events-none',
                    )}
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px] px-2 py-1">
                {label}
                {shortcut && (
                    <span className="ml-1.5 opacity-40">{shortcut}</span>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

function Sep() {
    return <div className="w-px h-4 bg-border/60 mx-1 shrink-0" />;
}

/* ── Paragraph type dropdown ─────────────────────────────────────────────── */

const BLOCK_TYPES = [
    {
        label: 'Paragraphe',
        shortLabel: 'Paragraphe',
        action: (e: Editor) => e.chain().focus().setParagraph().run(),
        isActive: (e: Editor) =>
            e.isActive('paragraph') &&
            !e.isActive('blockquote') &&
            !e.isActive('codeBlock'),
    },
    {
        label: 'Titre 1',
        shortLabel: 'Titre 1',
        action: (e: Editor) => e.chain().focus().setHeading({ level: 1 }).run(),
        isActive: (e: Editor) => e.isActive('heading', { level: 1 }),
        className: 'font-bold text-[15px]',
    },
    {
        label: 'Titre 2',
        shortLabel: 'Titre 2',
        action: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run(),
        isActive: (e: Editor) => e.isActive('heading', { level: 2 }),
        className: 'font-semibold text-[13px]',
    },
    {
        label: 'Titre 3',
        shortLabel: 'Titre 3',
        action: (e: Editor) => e.chain().focus().setHeading({ level: 3 }).run(),
        isActive: (e: Editor) => e.isActive('heading', { level: 3 }),
        className: 'font-medium text-[12px]',
    },
    {
        label: 'Citation',
        shortLabel: 'Citation',
        action: (e: Editor) => e.chain().focus().toggleBlockquote().run(),
        isActive: (e: Editor) => e.isActive('blockquote'),
        className: 'italic text-muted-foreground',
    },
    {
        label: 'Bloc de code',
        shortLabel: 'Code',
        action: (e: Editor) => e.chain().focus().toggleCodeBlock().run(),
        isActive: (e: Editor) => e.isActive('codeBlock'),
        className: 'font-mono text-[11px]',
    },
] as const;

function ParagraphTypeDropdown({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);

    const active = BLOCK_TYPES.find((t) => t.isActive(editor)) ?? BLOCK_TYPES[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'h-7 flex items-center gap-1 px-2 rounded-md transition-all duration-100',
                    'text-xs text-muted-foreground hover:text-foreground hover:bg-accent',
                    open && 'bg-accent text-foreground',
                )}
            >
                <Type className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{active.shortLabel}</span>
                <ChevronDown className="h-3 w-3 opacity-40 shrink-0" />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                    {/* Menu */}
                    <div className="absolute top-full left-0 z-30 mt-1 min-w-[144px] rounded-xl border border-border bg-background shadow-lg shadow-black/[0.08] py-1 overflow-hidden">
                        {BLOCK_TYPES.map((t) => (
                            <button
                                key={t.label}
                                type="button"
                                onClick={() => {
                                    t.action(editor);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-2 w-full text-left px-3 py-2 text-[12px] transition-colors',
                                    'hover:bg-accent',
                                    t.isActive(editor)
                                        ? 'text-foreground bg-accent/50'
                                        : 'text-muted-foreground',
                                    'className' in t ? t.className : '',
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Alignment dropdown ──────────────────────────────────────────────────── */

const ALIGNMENTS = [
    { label: 'Gauche', value: 'left', Icon: AlignLeft },
    { label: 'Centré', value: 'center', Icon: AlignCenter },
    { label: 'Droite', value: 'right', Icon: AlignRight },
    { label: 'Justifié', value: 'justify', Icon: AlignJustify },
] as const;

function AlignDropdown({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);

    const active =
        ALIGNMENTS.find((a) => editor.isActive({ textAlign: a.value })) ??
        ALIGNMENTS[0];
    const ActiveIcon = active.Icon;

    return (
        <div className="relative">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className={cn(
                            'h-7 flex items-center gap-0.5 px-1.5 rounded-md transition-all duration-100',
                            'text-muted-foreground hover:text-foreground hover:bg-accent',
                            open && 'bg-accent text-foreground',
                        )}
                    >
                        <ActiveIcon className="h-3 w-3" />
                        <ChevronDown className="h-3 w-3 opacity-40" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[11px] px-2 py-1">
                    Alignement
                </TooltipContent>
            </Tooltip>

            {open && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 z-30 mt-1 w-36 rounded-xl border border-border bg-background shadow-lg shadow-black/[0.08] py-1 overflow-hidden">
                        {ALIGNMENTS.map(({ label, value, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setTextAlign(value).run();
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-2.5 w-full text-left px-3 py-2 text-[12px] transition-colors',
                                    'hover:bg-accent',
                                    editor.isActive({ textAlign: value })
                                        ? 'text-foreground bg-accent/50'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <Icon className="h-3 w-3 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Main toolbar ────────────────────────────────────────────────────────── */

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
    function handleImageInsert() {
        if (!onImageUpload) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const url = await onImageUpload(file);
            if (url) editor.chain().focus().setImage({ src: url }).run();
        };
        input.click();
    }

    function handleLink() {
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const url = window.prompt('URL du lien :');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    }

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 bg-background/80 backdrop-blur-md px-3 py-1.5 sticky top-0 z-10">

            {/* ── History ──────────────────────────────────────────── */}
            <ToolBtn
                label="Annuler" shortcut="⌘Z"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Refaire" shortcut="⌘⇧Z"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* ── Block type dropdown ───────────────────────────────── */}
            <ParagraphTypeDropdown editor={editor} />

            <Sep />

            {/* ── Inline formatting ─────────────────────────────────── */}
            <ToolBtn
                label="Gras" shortcut="⌘B"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Italique" shortcut="⌘I"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Souligné" shortcut="⌘U"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Barré"
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Surligné"
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
                <Highlighter className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Code inline" shortcut="⌘E"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* ── Alignment dropdown ────────────────────────────────── */}
            <AlignDropdown editor={editor} />

            <Sep />

            {/* ── Blocks ────────────────────────────────────────────── */}
            <ToolBtn
                label="Liste à puces"
                active={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Liste numérotée"
                active={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Tâches"
                active={editor.isActive('taskList')}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
                <CheckSquare className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Bloc de code"
                active={editor.isActive('codeBlock')}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <Code2 className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Séparateur"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* ── Media ─────────────────────────────────────────────── */}
            <ToolBtn
                label="Lien"
                active={editor.isActive('link')}
                onClick={handleLink}
            >
                <Link2 className="h-3 w-3" />
            </ToolBtn>
            {onImageUpload && (
                <ToolBtn label="Image" onClick={handleImageInsert}>
                    <ImageIcon className="h-3 w-3" />
                </ToolBtn>
            )}
        </div>
    );
}
