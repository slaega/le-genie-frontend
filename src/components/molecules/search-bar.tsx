'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setOpen(false)
    setQuery('')
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="h-8 w-40 sm:w-56 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          aria-label="Lancer la recherche"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-white hover:bg-gray-800"
      aria-label="Rechercher"
      onClick={handleOpen}
    >
      <Search className="h-5 w-5" />
    </Button>
  )
}
