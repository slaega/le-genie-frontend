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

    return (
        <div className="space-y-10">

            {/* ── Cover + Avatar ──────────────────────────── */}
            <section className="space-y-5">
                <FieldLabel text="Photo de couverture" />

                {/* Cover */}
                <div
                    className="relative h-36 w-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-muted cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                >
                    {(coverPreview ?? user.coverPath) && (
                        <Image
                            src={coverPreview ?? user.coverPath!}
                            alt="Couverture"
                            fill
                            className="object-cover"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Modifier
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
                            className="h-16 w-16 text-xl ring-4 ring-background"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Photo de profil</p>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="text-xs text-primary hover:underline underline-offset-2"
                        >
                            Changer
                        </button>
                        <p className="text-[11px] text-muted-foreground/50 block">
                            JPG, PNG ou WebP · 5 Mo max
                        </p>
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

            {/* ── Informations ─────────────────────────────── */}
            <section className="space-y-5">
                <FieldLabel text="Informations" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <LineField
                        label="Nom complet"
                        icon={UserIcon}
                        required
                        value={name}
                        onChange={(v) => setName(v)}
                        placeholder="Votre nom"
                        maxLength={100}
                    />
                    <LineField
                        label="Localisation"
                        icon={MapPin}
                        value={location}
                        onChange={(v) => setLocation(v)}
                        placeholder="Paris, France"
                        maxLength={150}
                    />
                </div>

                <LineField
                    label="Titre · Rôle professionnel"
                    value={professionalRole}
                    onChange={(v) => setProfessionalRole(v)}
                    placeholder="ex. Développeur full-stack, Designer produit…"
                    maxLength={150}
                />

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <FieldLabel text="Bio courte" />
                        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                            {bio.length}/280
                        </span>
                    </div>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Une ligne qui vous décrit — apparaît sous votre nom sur votre page publique."
                        maxLength={280}
                        rows={2}
                        className={cn(lineInputClass, 'resize-none w-full leading-relaxed')}
                    />
                </div>
            </section>

            {/* ── À propos ────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <FieldLabel text="À propos" />
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                            Présentez-vous librement — votre parcours, vos centres d&apos;intérêt,
                            ce qui vous anime. Affiché sur votre page publique.
                        </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40 tabular-nums shrink-0 mt-0.5">
                        {about.length}/5000
                    </span>
                </div>
                <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Bonjour, je suis… partagez votre histoire, vos passions, ce que vous créez sur cette plateforme."
                    maxLength={5000}
                    rows={8}
                    className={cn(lineInputClass, 'resize-y w-full leading-relaxed text-sm')}
                />
            </section>

            {/* ── Présence en ligne ────────────────────────── */}
            <section className="space-y-5">
                <FieldLabel text="Présence en ligne" />

                <LineField
                    label="Site web"
                    icon={Globe}
                    value={website}
                    onChange={(v) => setWebsite(v)}
                    placeholder="https://monsite.dev"
                    type="url"
                    maxLength={2048}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <PrefixField
                        label="Twitter / X"
                        icon={Twitter}
                        prefix="@"
                        value={twitterHandle}
                        onChange={(v) => setTwitterHandle(v.replace(/^@/, ''))}
                        placeholder="monpseudo"
                        maxLength={100}
                    />
                    <PrefixField
                        label="GitHub"
                        icon={Github}
                        prefix="@"
                        value={githubHandle}
                        onChange={(v) => setGithubHandle(v.replace(/^@/, ''))}
                        placeholder="monpseudo"
                        maxLength={100}
                    />
                </div>
            </section>

            {/* ── Actions ─────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 py-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm">
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

/* ── Design tokens ────────────────────────────────────────────────────────── */

const lineInputClass = [
    'bg-transparent text-sm text-foreground',
    'border-0 border-b border-border',
    'focus:border-foreground/40 focus:outline-none',
    'rounded-none px-0 py-2 transition-colors duration-150',
    'placeholder:text-muted-foreground/30',
].join(' ');

/* ── Sub-components ───────────────────────────────────────────────────────── */

function FieldLabel({ text }: { text: string }) {
    return (
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
            {text}
        </p>
    );
}

function LineField({
    label,
    icon: Icon,
    required,
    value,
    onChange,
    placeholder,
    maxLength,
    type = 'text',
}: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    required?: boolean;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    maxLength?: number;
    type?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/50">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={cn(lineInputClass, 'w-full')}
            />
        </div>
    );
}

function PrefixField({
    label,
    icon: Icon,
    prefix,
    value,
    onChange,
    placeholder,
    maxLength,
}: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    prefix: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    maxLength?: number;
}) {
    return (
        <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/50">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </label>
            <div className="flex items-baseline gap-1 border-b border-border focus-within:border-foreground/40 transition-colors duration-150">
                <span className="text-muted-foreground/50 text-sm pb-2">{prefix}</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="flex-1 bg-transparent text-sm text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/30"
                />
            </div>
        </div>
    );
}
