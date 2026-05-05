'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'
import type { User } from '@/lib/api/types'
import { useRouter } from 'next/navigation'

interface ProfileEditDialogProps {
  user: User
}

export function ProfileEditDialog({ user }: ProfileEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(user.name)
  const [professionalRole, setProfessionalRole] = useState(user.professionalRole ?? '')
  const [isPending, setIsPending] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setIsPending(true)
    try {
      await api.patch('/auth/me', { name: name.trim(), professionalRole: professionalRole.trim() || null })
      toast.success('Profil mis à jour !')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        Modifier le profil
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nom</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-role">Rôle</Label>
              <Input
                id="profile-role"
                value={professionalRole}
                onChange={(e) => setProfessionalRole(e.target.value)}
                placeholder="Ex: Développeur full-stack"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending || !name.trim()}>
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
