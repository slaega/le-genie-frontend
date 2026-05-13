'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Camera,
    Globe,
    Github,
    Twitter,
    MapPin,
    Save,
    User as UserIcon,
    AtSign,
    Check,
} from 'lucide-react';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import type { User } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import { userHandle } from '@/lib/post-url';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    user: User;
}

/* ── Design tokens ────────────────────────────────────────────────────────── */

const fieldClass = [
    'w-full bg-transparent text-[14px] text-foreground',
    'border-0 border-b-[1.5px] border-border',
    'focus:border-foreground focus:outline-none',
    'rounded-none px-0 py-2 transition-colors duration-150',
    'placeholder:text-muted-foreground/40',
].join(' ');

/* ── Section — flat, plain heading, no card wrapper ──────────────────────── */

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-[17px] font-bold text-foreground tracking-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-[13px] text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>
            <div className="space-y-7">{children}</div>
        </section>
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
        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-foreground/60 mb-2 select-none">
            {Icon && <Icon className="h-3 w-3" />}
            {text}
            {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
    );
}

/* ── Username validation ──────────────────────────────────────────────────── */

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$/;

function validateUsername(value: string): string | null {
    if (!value) return null; // optional — backend will assign fallback
    if (value.length < 3) return '3 caractères minimum.';
    if (value.length > 30) return '30 caractères maximum.';
    if (!USERNAME_RE.test(value)) {
        return 'Lettres minuscules, chiffres, tirets et underscores uniquement.';
    }
    return null;
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
    const [username, setUsername] = useState(user.username ?? '');
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [professionalRole, setProfessionalRole] = useState(
        user.professionalRole ?? ''
    );
    const [bio, setBio] = useState(user.bio ?? '');
    const [about, setAbout] = useState(user.about ?? '');
    const [website, setWebsite] = useState(user.website ?? '');
    const [twitterHandle, setTwitterHandle] = useState(
        user.twitterHandle ?? ''
    );
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
        if (type === 'avatar') {
            setAvatarFile(file);
            setAvatarPreview(url);
        } else {
            setCoverFile(file);
            setCoverPreview(url);
        }
    }

    function handleUsernameChange(raw: string) {
        // Auto-normalize: lowercase, strip leading @, strip spaces.
        const v = raw.toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
        setUsername(v);
        setUsernameError(validateUsername(v));
    }

    async function handleSave() {
        if (!name.trim()) return;
        const usernameValidation = validateUsername(username);
        if (usernameValidation) {
            setUsernameError(usernameValidation);
            toast.error(usernameValidation);
            return;
        }

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
                username: username.trim() || null,
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
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setUsernameError('Cet identifiant est déjà pris.');
                toast.error('Cet identifiant est déjà pris.');
            } else {
                toast.error('Erreur lors de la mise à jour du profil');
            }
        } finally {
            setIsPending(false);
        }
    }

    const coverSrc = coverPreview ?? user.coverPath;
    const avatarSrc = avatarPreview ?? user.avatarPath;

    // What the public URL will look like — preview for the user.
    const previewHandle =
        validateUsername(username) === null && username.trim()
            ? username.trim()
            : userHandle({
                  id: user.id,
                  username: null,
                  name: name || user.name,
                  email: user.email,
              });

    return (
        <div className="space-y-12">
            {/* ── Photo block — no card wrapper, just images ────────── */}
            <div>
                {/* Cover */}
                <div
                    className="relative h-40 sm:h-44 rounded-2xl bg-muted cursor-pointer group overflow-hidden"
                    onClick={() => coverInputRef.current?.click()}
                >
                    {coverSrc && (
                        <Image
                            src={coverSrc}
                            alt="Couverture"
                            fill
                            className="object-cover"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/45 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                            <Camera className="h-3.5 w-3.5 text-white" />
                            <span className="text-xs text-white font-medium">
                                Modifier la couverture
                            </span>
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

                {/* Avatar + identity strip (sits below cover, overlaps slightly) */}
                <div className="flex items-end gap-4 -mt-12 relative z-10 px-1 sm:px-2">
                    <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <UserAvatar
                            name={name || user.name}
                            avatarPath={avatarSrc}
                            size="xl"
                            className="h-24 w-24 ring-4 ring-background"
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
                    <div className="flex-1 min-w-0 pb-2">
                        <p className="font-bold text-[15px] leading-tight truncate text-foreground">
                            {name || user.name}
                        </p>
                        <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                            @{previewHandle}
                        </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground shrink-0 pb-2">
                        JPG, PNG · 5 Mo max
                    </p>
                </div>
            </div>

            {/* ── Identité ────────────────────────────────────────────── */}
            <Section
                title="Identité"
                description="Comment vous apparaissez à la communauté."
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <FieldLabel
                            text="Nom complet"
                            icon={UserIcon}
                            required
                        />
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

                {/* Username (the unique handle used in URLs) */}
                <div>
                    <FieldLabel
                        text="Identifiant unique (username)"
                        icon={AtSign}
                    />
                    <div
                        className={cn(
                            'flex items-baseline gap-0 border-b-[1.5px] transition-colors duration-150',
                            usernameError
                                ? 'border-red-500'
                                : 'border-border focus-within:border-foreground'
                        )}
                    >
                        <span className="text-muted-foreground/60 text-[14px] pb-2 select-none">
                            legenie.app/@
                        </span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                handleUsernameChange(e.target.value)
                            }
                            placeholder="votre-pseudo"
                            maxLength={30}
                            autoComplete="off"
                            spellCheck={false}
                            className="flex-1 bg-transparent text-[14px] text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/40 font-mono"
                        />
                        {!usernameError && username.trim().length >= 3 && (
                            <Check className="h-3.5 w-3.5 text-foreground/60 mr-1 mb-2 shrink-0" />
                        )}
                    </div>
                    <p
                        className={cn(
                            'text-[11px] mt-1.5',
                            usernameError
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                        )}
                    >
                        {usernameError ??
                            "Lettres minuscules, chiffres, tirets — c'est l'URL de votre page et de vos articles."}
                    </p>
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
            </Section>

            {/* ── Bio ─────────────────────────────────────────────────── */}
            <Section
                title="Bio"
                description="Quelques mots qui vous décrivent."
            >
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <FieldLabel text="Bio courte" />
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                            {bio.length}/280
                        </span>
                    </div>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Une ligne qui vous décrit — apparaît sous votre nom."
                        maxLength={280}
                        rows={2}
                        className={cn(
                            fieldClass,
                            'resize-none leading-relaxed'
                        )}
                    />
                </div>

                <div>
                    <div className="flex items-start justify-between mb-2">
                        <FieldLabel text="À propos" />
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mt-0.5">
                            {about.length}/5000
                        </span>
                    </div>
                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Bonjour, je suis… partagez votre parcours, vos passions, ce qui vous anime."
                        maxLength={5000}
                        rows={6}
                        className={cn(
                            fieldClass,
                            'resize-y leading-relaxed text-[14px]'
                        )}
                    />
                </div>
            </Section>

            {/* ── Présence en ligne ────────────────────────────────────── */}
            <Section
                title="Présence en ligne"
                description="Liens visibles sur votre page publique."
            >
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <FieldLabel text="Twitter / X" icon={Twitter} />
                        <div className="flex items-baseline gap-1 border-b-[1.5px] border-border focus-within:border-foreground transition-colors duration-150">
                            <span className="text-muted-foreground/60 text-[14px] pb-2">
                                @
                            </span>
                            <input
                                type="text"
                                value={twitterHandle}
                                onChange={(e) =>
                                    setTwitterHandle(
                                        e.target.value.replace(/^@/, '')
                                    )
                                }
                                placeholder="monpseudo"
                                maxLength={100}
                                className="flex-1 bg-transparent text-[14px] text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel text="GitHub" icon={Github} />
                        <div className="flex items-baseline gap-1 border-b-[1.5px] border-border focus-within:border-foreground transition-colors duration-150">
                            <span className="text-muted-foreground/60 text-[14px] pb-2">
                                @
                            </span>
                            <input
                                type="text"
                                value={githubHandle}
                                onChange={(e) =>
                                    setGithubHandle(
                                        e.target.value.replace(/^@/, '')
                                    )
                                }
                                placeholder="monpseudo"
                                maxLength={100}
                                className="flex-1 bg-transparent text-[14px] text-foreground border-0 focus:outline-none rounded-none px-0 py-2 placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── Save bar ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 py-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        isPending || !name.trim() || usernameError !== null
                    }
                    className={cn(
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold',
                        'bg-foreground text-background transition-all duration-150 shadow-sm',
                        'hover:opacity-90 active:scale-[0.98]',
                        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100'
                    )}
                >
                    <Save className="h-3.5 w-3.5" />
                    {isPending ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}
