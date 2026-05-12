'use client';

import { useRef, useState } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User } from '@/lib/api/types';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/atoms/user-avatar';

interface ProfileEditDialogProps {
    user: User;
}

export function ProfileEditDialog({ user }: ProfileEditDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(user.name);
    const [professionalRole, setProfessionalRole] = useState(
        user.professionalRole ?? ''
    );
    const [isPending, setIsPending] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 3 Mo)');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleSave() {
        if (!name.trim()) return;
        setIsPending(true);
        try {
            // 1. Upload avatar if changed
            if (avatarFile) {
                const form = new FormData();
                form.append('avatarFile', avatarFile);
                await api.patch('/auth/me/avatar', form);
            }

            // 2. Update name & role
            await api.patch('/auth/me', {
                name: name.trim(),
                professionalRole: professionalRole.trim() || null,
            });

            toast.success('Profil mis à jour !');
            setOpen(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            router.refresh();
        } catch {
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setIsPending(false);
        }
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            // Reset avatar preview when closing without saving
            setAvatarPreview(null);
            setAvatarFile(null);
        }
        setOpen(isOpen);
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

            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Avatar upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UserAvatar
                                    name={name || user.name}
                                    avatarPath={
                                        avatarPreview ?? user.avatarPath
                                    }
                                    size="lg"
                                    className="h-20 w-20 text-2xl"
                                />
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Changer la photo de profil
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

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
                                onChange={(e) =>
                                    setProfessionalRole(e.target.value)
                                }
                                placeholder="Ex: Développeur full-stack"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => handleClose(false)}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !name.trim()}
                        >
                            {isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
