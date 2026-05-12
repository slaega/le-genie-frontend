'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Camera, Globe, Github, Twitter, MapPin,
    Save, User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isPending, setIsPending] = useState(false);

    // Avatar
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Cover
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    // Fields
    const [name, setName] = useState(user.name);
    const [professionalRole, setProfessionalRole] = useState(user.professionalRole ?? '');
    const [bio, setBio] = useState(user.bio ?? '');
    const [about, setAbout] = useState(user.about ?? '');
    const [website, setWebsite] = useState(user.website ?? '');
    const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle ?? '');
    const [githubHandle, setGithubHandle] = useState(user.githubHandle ?? '');
    const [location, setLocation] = useState(user.location ?? '');

    function handleImageFile(
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'avatar' | 'cover'
    ) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 5 Mo)');
            return;
        }
        const url = URL.createObjectURL(file);
        if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); }
        else { setCoverFile(file); setCoverPreview(url); }
    }

    async function handleSave() {
        if (!name.trim()) return;
        setIsPending(true);
        try {
            if (avatarFile) {
                const form = new FormData();
                form.append('avatarFile', avatarFile);
                await api.patch('/auth/me/avatar', form);
            }
            if (coverFile) {
                const form = new FormData();
                form.append('avatarFile', coverFile);
                await api.patch('/auth/me/cover', form);
            }
            await api.patch('/auth/me', {
                name: name.trim(),
                professionalRole: professionalRole.trim() || null,
                bio: bio.trim() || null,
                about: about.trim() || null,
                website: website.trim() || null,
                twitterHandle: twitterHandle.replace(/^@/, '').trim() || null,
                githubHandle: githubHandle.replace(/^@/, '').trim() || null,
                location: location.trim() || null,
            });
            toast.success('Profil mis à jour !');
            router.refresh();
        } catch {
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="space-y-8">

            {/* ── Cover + Avatar ─────────────────────────────────────────── */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
                    Photos
                </h2>

                {/* Cover */}
                <div
                    className="relative h-40 w-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-muted border border-border cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                >
                    {(coverPreview ?? user.coverPath) ? (
                        <Image
                            src={coverPreview ?? user.coverPath!}
                            alt="Couverture"
                            fill
                            className="object-cover"
                        />
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover:bg-black/30 transition-colors">
                        <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Changer la photo de couverture
                        </span>
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageFile(e, 'cover')}
                    />
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <UserAvatar
                            name={name || user.name}
                            avatarPath={avatarPreview ?? user.avatarPath}
                            size="lg"
                            className="h-20 w-20 text-2xl ring-4 ring-background"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Photo de profil</p>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="text-xs text-primary hover:underline"
                        >
                            Changer
                        </button>
                        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — 5 Mo max</p>
                    </div>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageFile(e, 'avatar')}
                    />
                </div>
            </section>

            <Divider />

            {/* ── Informations de base ───────────────────────────────────── */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
                    Informations
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nom complet" icon={UserIcon} required>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
                            maxLength={100}
                        />
                    </Field>
                    <Field label="Localisation" icon={MapPin}>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Paris, France"
                            maxLength={150}
                        />
                    </Field>
                </div>

                <Field label="Titre / Rôle professionnel">
                    <Input
                        value={professionalRole}
                        onChange={(e) => setProfessionalRole(e.target.value)}
                        placeholder="Ex: Développeur full-stack · Ingénieur ML"
                        maxLength={150}
                    />
                </Field>

                <Field
                    label="Bio courte"
                    hint={`${bio.length}/280`}
                >
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Une ligne qui vous décrit — apparaît sous votre nom sur votre profil public."
                        maxLength={280}
                        rows={2}
                        className="resize-none"
                    />
                </Field>
            </section>

            <Divider />

            {/* ── À propos ──────────────────────────────────────────────── */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
                        À propos
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Texte long — présentez-vous, votre parcours, vos centres d&apos;intérêt.
                        Affiché sur votre page publique.
                    </p>
                </div>
                <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Je suis développeur passionné par les systèmes distribués…"
                    maxLength={5000}
                    rows={8}
                    className="resize-y font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">{about.length}/5000</p>
            </section>

            <Divider />

            {/* ── Présence en ligne ─────────────────────────────────────── */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
                    Présence en ligne
                </h2>

                <Field label="Site web" icon={Globe}>
                    <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://monsite.dev"
                        type="url"
                        maxLength={2048}
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Twitter / X" icon={Twitter}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                            <Input
                                value={twitterHandle}
                                onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ''))}
                                placeholder="monpseudo"
                                className="pl-7"
                                maxLength={100}
                            />
                        </div>
                    </Field>
                    <Field label="GitHub" icon={Github}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                            <Input
                                value={githubHandle}
                                onChange={(e) => setGithubHandle(e.target.value.replace(/^@/, ''))}
                                placeholder="monpseudo"
                                className="pl-7"
                                maxLength={100}
                            />
                        </div>
                    </Field>
                </div>
            </section>

            {/* ── Actions ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-background pb-4">
                <Button
                    onClick={handleSave}
                    disabled={isPending || !name.trim()}
                    className="gap-2 min-w-32"
                >
                    <Save className="h-4 w-4" />
                    {isPending ? 'Enregistrement…' : 'Sauvegarder'}
                </Button>
            </div>
        </div>
    );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function Divider() {
    return <hr className="border-border" />;
}

function Field({
    label,
    icon: Icon,
    hint,
    required,
    children,
}: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label className={cn('flex items-center gap-1.5', required && 'after:content-["*"] after:text-destructive after:ml-0.5')}>
                    {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                    {label}
                </Label>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            {children}
        </div>
    );
}
