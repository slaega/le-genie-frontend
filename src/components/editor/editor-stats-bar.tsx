'use client'

import type { Editor } from '@tiptap/react'
import { Clock, FileText, CheckCircle2, Loader2 } from 'lucide-react'

interface EditorStatsBarProps {
  editor: Editor
  isSaving?: boolean
  lastSaved?: Date | null
}

function wordsToReadingTime(words: number): string {
  const wpm = 200
  const minutes = Math.ceil(words / wpm)
  if (minutes < 1) return '< 1 min'
  return `${minutes} min`
}

export function EditorStatsBar({ editor, isSaving, lastSaved }: EditorStatsBarProps) {
  const chars = editor.storage.characterCount?.characters() ?? 0
  const words = editor.storage.characterCount?.words() ?? 0

  return (
    <div className="flex items-center gap-4 border-t px-6 py-2 text-xs text-muted-foreground bg-muted/20">
      <span className="flex items-center gap-1.5">
        <FileText className="h-3 w-3" />
        {words} {words === 1 ? 'mot' : 'mots'}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {wordsToReadingTime(words)} de lecture
      </span>
      <span className="hidden sm:block">{chars} caractères</span>

      <div className="ml-auto flex items-center gap-1.5">
        {isSaving ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Enregistrement...</span>
          </>
        ) : lastSaved ? (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>
              Sauvegardé à{' '}
              {lastSaved.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}
