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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorBubbleMenuProps {
    editor: Editor;
}

function BubbleBtn({
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
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn(
                'h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-100',
                'text-zinc-400 hover:text-zinc-100 hover:bg-white/10',
                active && 'text-zinc-50 bg-white/15',
            )}
        >
            {children}
        </button>
    );
}

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
            <BubbleBtn
                label="Gras"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-3.5 w-3.5" />
            </BubbleBtn>
            <BubbleBtn
                label="Italique"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-3.5 w-3.5" />
            </BubbleBtn>
            <BubbleBtn
                label="Souligné"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-3.5 w-3.5" />
            </BubbleBtn>
            <BubbleBtn
                label="Barré"
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </BubbleBtn>
            <BubbleBtn
                label="Code"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-3.5 w-3.5" />
            </BubbleBtn>
            <BubbleBtn
                label="Surligné"
                active={editor.isActive('highlight')}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
                <Highlighter className="h-3.5 w-3.5" />
            </BubbleBtn>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <BubbleBtn
                label={editor.isActive('link') ? 'Retirer le lien' : 'Ajouter un lien'}
                active={editor.isActive('link')}
                onClick={handleLink}
            >
                {editor.isActive('link') ? (
                    <Link2Off className="h-3.5 w-3.5" />
                ) : (
                    <Link2 className="h-3.5 w-3.5" />
                )}
            </BubbleBtn>
        </BubbleMenu>
    );
}
