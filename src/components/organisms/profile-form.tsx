'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Camera, Globe, Github, Twitter, MapPin,
    Save, User as UserIcon,
} from 'lucide-react';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    user: User;
}

/* ── Design tokens ────────────────────────────────────────────────────────── */

const fieldClass = [
    'w-full bg-transparent text-sm text-foreground',
    'border-0 border-b border-border',
    'focus:border-foreground/40 focus:outline-none',
    'rounded-none px-0 py-2 transition-colors duration-150',
    'placeholder:text-muted-foreground/25',
].join(' ');

/* ── Section card ─────────────────────────────────────────────────────────── */

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="px-5 py-3 border-b border-border/40 bg-muted/20">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    {title}
                </p>
            </div>
            <div className="p-5 space-y-5">{children}</div>
        </div>
    );
}

/* ── Field label ──────────────────────────────────────────────────────────── */

function FieldLabel({
    text,
    icon: Icon,
    required,
}: {
    text: string;
    icon?: React.ComponentType<{ className?: string }>;
    required?: boolean;
}) {
    return (
        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-1.5 select-none">
            {Icon && <Icon className="h-3 w-3" />}
            {text}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}

/* ── ProfileForm ──────────────────────────────────────────────────────────── */

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isPending, setIsPending] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

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

    const coverSrc = coverPreview ?? user.coverPath;
    const avatarSrc = avatarPreview ?? user.avatarPath;

    return (
        <div className="space-y-6">

            {/* ── Photo section ───────────────────────────────────────── */}
            <div className="rounded-xl border border-border/60 overflow-hidden">
                {/* Cover */}
                <div
                    className="relative h-40 bg-gradient-to-br from-primary/15 via-muted to-muted cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                >
                    {coverSrc && (
                        <Image src={coverSrc} alt="Couverture" fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Modifier la couverture
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

                {/* Avatar + name strip */}
                <div className="flex items-end gap-4 px-5 pb-4 -mt-9 relative z-10">
                    <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <UserAvatar
                            name={name || user.name}
                            avatarPath={avatarSrc}
                            size="lg"
                            className="h-[72px] w-[72px] text-2xl ring-[3px] ring-background shadow-sm"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleImageFile(e, 'avatar')}
                        />
                    </div>
                    <div className="flex-1 min-w-0 pt-10">
                        <p className="font-bold text-[15px] leading-tight truncate">
                            {name || user.name}
                        </p>
                        <p className="text-[12px] text-muted-foreground/60 truncate">
                            {professionalRole || 'Rôle professionnel'}
                        </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/35 shrink-0 pb-1">
                        JPG, PNG · 5 Mo max
                    </p>
                </div>
            </div>

            {/* ── Identité ────────────────────────────────────────────── */}
            <SectionCard title="Identité">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <FieldLabel text="Nom complet" icon={UserIcon} required />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
                            maxLength={100}
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <FieldLabel text="Localisation" icon={MapPin} />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Paris, France"
                            maxLength={150}
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div>
                    <FieldLabel text="Titre · Rôle professionnel" />
                    <input
                        type="text"
                        value={professionalRole}
                        onChange={(e) => setProfessionalRole(e.target.value)}
                        placeholder="ex. Développeur full-stack, Designer produit…"
                        maxLength={150}
                        className={fieldClass}
                    />
                </div>
            </SectionCard>

            {/* ── Bio ─────────────────────────────────────────────────── */}
            <SectionCard title="Bio">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <FieldLabel text="Bio courte" />
                        <span className="text-[10px] text-muted-foreground/35 tabular-nums">
                            {bio.length}/280
                        </span>
                    </div>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Une ligne qui vous décrit — apparaît sous votre nom."
                        maxLength={280}
                        rows={2}
                        className={cn(fieldClass, 'resize-none leading-relaxed')}
                    />
                </div>

                <div>
                    <div className="flex items-start justify-between mb-1.5">
                        <div>
                            <FieldLabel text="À propos" />
                            <p className="text-[11px] text-muted-foreground/45 -mt-1">
                                Partagez votre parcours, vos centres d&apos;intérêt, ce qui vous anime.
                            </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/35 tabular-nums shrink-0 mt-0.5">
                            {about.length}/5000
                        </span>
                    </div>
                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Bonjour, je suis… partagez votre histoire et vos passions."
                        maxLength={5000}
                        rows={6}
                        className={cn(fieldClass, 'resize-y leading-relaxed text-sm mt-2')}
                    />
                </div>
            </SectionCard>

            {/* ── Présence en ligne ────────────────────────────────────── */}
            <SectionCard title="Présence en ligne">
                <div>
                    <FieldLabel text="Site web" icon={Globe} />
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://monsite.dev"
                        maxLength={2048}
                        className={fieldClass}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Twitter */}
                    <div>
                        <FieldLabel text="Twitter / X" icon={Twitter} />
                        <div className="flex items-baseline gap-1 border-b border-border focus-within:border-foreground/40 transition-colors duration-150">
                            <span className="text-muted-foreground/40 text-sm pb-2">@</span>
                            <input
                                type="text"
                                value={twitterHandle}
                                onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ''))}
                                placeholder="monpseudo"
                                maxLength={100}
                                className="flex-1 bg-transparent text-sm text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/25"
                            />
                        </div>
                    </div>

                    {/* GitHub */}
                    <div>
                        <FieldLabel text="GitHub" icon={Github} />
                        <div className="flex items-baseline gap-1 border-b border-border focus-within:border-foreground/40 transition-colors duration-150">
                            <span className="text-muted-foreground/40 text-sm pb-2">@</span>
                            <input
                                type="text"
                                value={githubHandle}
                                onChange={(e) => setGithubHandle(e.target.value.replace(/^@/, ''))}
                                placeholder="monpseudo"
                                maxLength={100}
                                className="flex-1 bg-transparent text-sm text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/25"
                            />
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ── Save bar ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 py-4 border-t border-border/50 sticky bottom-0 bg-background/95 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || !name.trim()}
                    className={cn(
                        'inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium',
                        'bg-foreground text-background transition-all duration-150',
                        'hover:opacity-90 active:scale-[0.98]',
                        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
                    )}
                >
                    <Save className="h-3.5 w-3.5" />
                    {isPending ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}
