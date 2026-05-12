'use client';

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
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Subscript,
    Superscript,
    Undo,
    Redo,
    Minus,
    Code,
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
    return <div className="w-px h-4 bg-border/70 mx-0.5 shrink-0" />;
}

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
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-background/70 backdrop-blur-sm px-2.5 py-1.5 sticky top-0 z-10">
            {/* History */}
            <ToolBtn
                label="Annuler"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                shortcut="⌘Z"
            >
                <Undo className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Refaire"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                shortcut="⌘⇧Z"
            >
                <Redo className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* Headings */}
            <ToolBtn
                label="Titre 1"
                active={editor.isActive('heading', { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Titre 2"
                active={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Titre 3"
                active={editor.isActive('heading', { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3 className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* Inline formatting */}
            <ToolBtn
                label="Gras"
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                shortcut="⌘B"
            >
                <Bold className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Italique"
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                shortcut="⌘I"
            >
                <Italic className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Souligné"
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                shortcut="⌘U"
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
                label="Code inline"
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
                shortcut="⌘E"
            >
                <Code className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Indice"
                active={editor.isActive('subscript')}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
                <Subscript className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Exposant"
                active={editor.isActive('superscript')}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
                <Superscript className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* Alignment */}
            <ToolBtn
                label="Gauche"
                active={editor.isActive({ textAlign: 'left' })}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <AlignLeft className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Centré"
                active={editor.isActive({ textAlign: 'center' })}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <AlignCenter className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Droite"
                active={editor.isActive({ textAlign: 'right' })}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <AlignRight className="h-3 w-3" />
            </ToolBtn>
            <ToolBtn
                label="Justifié"
                active={editor.isActive({ textAlign: 'justify' })}
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
                <AlignJustify className="h-3 w-3" />
            </ToolBtn>

            <Sep />

            {/* Blocks */}
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
                label="Citation"
                active={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-3 w-3" />
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

            {/* Media */}
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
