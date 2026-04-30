'use client'

import { BubbleMenu, type Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Link2, Link2Off, Highlighter
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'

interface EditorBubbleMenuProps {
  editor: Editor
}

function BubbleBtn({
  label, active, onClick, children,
}: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={onClick}
      aria-label={label}
      className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
    >
      {children}
    </Toggle>
  )
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  function handleLink() {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('URL :')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top' }}
      className="flex items-center gap-0.5 rounded-lg border bg-background/95 backdrop-blur p-1 shadow-lg"
    >
      <BubbleBtn label="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </BubbleBtn>
      <BubbleBtn label="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </BubbleBtn>
      <BubbleBtn label="Souligné" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="h-3.5 w-3.5" />
      </BubbleBtn>
      <BubbleBtn label="Barré" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" />
      </BubbleBtn>
      <BubbleBtn label="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-3.5 w-3.5" />
      </BubbleBtn>
      <BubbleBtn label="Surligné" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter className="h-3.5 w-3.5" />
      </BubbleBtn>
      <Separator orientation="vertical" className="mx-0.5 h-4" />
      <BubbleBtn label={editor.isActive('link') ? 'Retirer le lien' : 'Ajouter un lien'} active={editor.isActive('link')} onClick={handleLink}>
        {editor.isActive('link') ? <Link2Off className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </BubbleBtn>
    </BubbleMenu>
  )
}
