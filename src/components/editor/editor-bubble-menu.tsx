'use client';

import { BubbleMenu, type Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Link2,
    Link2Off,
    Highlighter,
    Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorBubbleMenuProps {
    editor: Editor;
}

/* ── Format icon button ──────────────────────────────────────────────────── */

function FmtBtn({
    label,
    active,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn(
                'h-7 w-7 flex items-center justify-center rounded-md transition-all duration-100',
                'text-zinc-400 hover:text-zinc-100 hover:bg-white/10',
                active && 'text-zinc-50 bg-white/[0.15]',
            )}
        >
            {children}
        </button>
    );
}

/* ── Text action button ──────────────────────────────────────────────────── */

function ActionBtn({
    label,
    active,
    onClick,
    icon: Icon,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all duration-100',
                'text-zinc-400 hover:text-zinc-100 hover:bg-white/10',
                active && 'text-zinc-50 bg-white/[0.15]',
            )}
        >
            {Icon && <Icon className="h-3 w-3 shrink-0" />}
            {label}
        </button>
    );
}

/* ── Divider ─────────────────────────────────────────────────────────────── */

function BubbleSep() {
    return <div className="w-px h-4 bg-white/[0.10] mx-0.5 shrink-0" />;
}

/* ── EditorBubbleMenu ────────────────────────────────────────────────────── */

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
    function handleLink() {
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const url = window.prompt('URL :');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    }

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 80, placement: 'top' }}
            className="flex items-center gap-0.5 rounded-xl border border-white/[0.08] bg-zinc-950 backdrop-blur-2xl p-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
            {/* Inline formatting */}
            <FmtBtn
                label="Gras (⌘B)"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-3.5 w-3.5" />
            </FmtBtn>
            <FmtBtn
                label="Italique (⌘I)"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-3.5 w-3.5" />
            </FmtBtn>
            <FmtBtn
                label="Souligné (⌘U)"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-3.5 w-3.5" />
            </FmtBtn>
            <FmtBtn
                label="Barré"
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </FmtBtn>
            <FmtBtn
                label="Code"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-3.5 w-3.5" />
            </FmtBtn>

            <BubbleSep />

            {/* Named actions */}
            <ActionBtn
                label="Surligner"
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                icon={Highlighter}
            />
            <ActionBtn
                label="Citation"
                active={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                icon={Quote}
            />

            <BubbleSep />

            <ActionBtn
                label={editor.isActive('link') ? 'Retirer' : 'Lien'}
                active={editor.isActive('link')}
                onClick={handleLink}
                icon={editor.isActive('link') ? Link2Off : Link2}
            />
        </BubbleMenu>
    );
}
