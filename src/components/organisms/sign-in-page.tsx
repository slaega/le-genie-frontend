'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Github, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendOtp, verifyOtp } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthProvider = 'github' | 'google' | 'microsoft';
type AuthTab = 'oauth' | 'otp-email' | 'otp-code';

// ─── Brand icons ──────────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23Z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.1A6.61 6.61 0 0 1 5.48 12c0-.73.13-1.44.36-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
            />
        </svg>
    );
}

function MicrosoftIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#00a4ef" />
            <rect x="1" y="11" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    );
}

// ─── Input — themed underline style ──────────────────────────────────────────

const inputClass = cn(
    'w-full bg-transparent text-[15px] text-foreground',
    'border-0 border-b-[1.5px] border-border',
    'focus:border-foreground focus:outline-none',
    'rounded-none px-0 py-2.5 transition-colors duration-150',
    'placeholder:text-muted-foreground/40'
);

// ─── OAuth buttons ────────────────────────────────────────────────────────────

function OAuthButton({
    provider,
    icon,
    label,
    loadingLabel,
    loading,
    disabled,
    onClick,
}: {
    provider: OAuthProvider;
    icon: React.ReactNode;
    label: string;
    loadingLabel: string;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'group relative w-full h-12 rounded-full border border-border bg-background',
                'flex items-center gap-3 px-5 text-[14px] font-semibold text-foreground',
                'hover:bg-muted hover:border-foreground/25 transition-all duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            aria-busy={loading}
            data-provider={provider}
        >
            <span className="h-5 w-5 flex items-center justify-center shrink-0">
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                    icon
                )}
            </span>
            <span className="flex-1 text-left">
                {loading ? loadingLabel : label}
            </span>
        </button>
    );
}

function OAuthButtons({
    loading,
    onOAuth,
    onSwitchToOtp,
}: {
    loading: OAuthProvider | null;
    onOAuth: (p: OAuthProvider) => void;
    onSwitchToOtp: () => void;
}) {
    return (
        <div className="space-y-3">
            <OAuthButton
                provider="google"
                icon={<GoogleIcon className="h-5 w-5" />}
                label="Continuer avec Google"
                loadingLabel="Redirection…"
                loading={loading === 'google'}
                disabled={!!loading}
                onClick={() => onOAuth('google')}
            />
            <OAuthButton
                provider="github"
                icon={<Github className="h-[18px] w-[18px]" />}
                label="Continuer avec GitHub"
                loadingLabel="Redirection…"
                loading={loading === 'github'}
                disabled={!!loading}
                onClick={() => onOAuth('github')}
            />
            <OAuthButton
                provider="microsoft"
                icon={<MicrosoftIcon className="h-[17px] w-[17px]" />}
                label="Continuer avec Microsoft"
                loadingLabel="Redirection…"
                loading={loading === 'microsoft'}
                disabled={!!loading}
                onClick={() => onOAuth('microsoft')}
            />

            {/* Divider */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="h-px w-full bg-border" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70 font-semibold">
                        ou
                    </span>
                </div>
            </div>

            <button
                type="button"
                disabled={!!loading}
                onClick={onSwitchToOtp}
                className="group w-full h-12 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md flex items-center gap-3 px-5 text-[14px] font-semibold transition-all duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
            >
                <Mail className="h-[17px] w-[17px]" />
                <span className="flex-1 text-left">
                    Continuer avec un code email
                </span>
            </button>
        </div>
    );
}

// ─── OTP — email step ─────────────────────────────────────────────────────────

function OtpEmailStep({
    onCodeSent,
    onBack,
}: {
    onCodeSent: (email: string) => void;
    onBack: () => void;
}) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await sendOtp({ email });
        setLoading(false);

        if (res?.validationErrors?._errors?.length) {
            toast.error(res.validationErrors._errors[0]);
            return;
        }
        if (res?.serverError) {
            toast.error('Erreur serveur. Réessayez.');
            return;
        }
        onCodeSent(email);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                    htmlFor="otp-email"
                    className="block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60 mb-2"
                >
                    Adresse email
                </label>
                <input
                    id="otp-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                />
                <p className="text-[11.5px] text-muted-foreground mt-2">
                    Un code à 6 chiffres valable 5 minutes vous sera envoyé.
                </p>
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-12"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi…
                    </>
                ) : (
                    'Envoyer le code'
                )}
            </Button>

            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour
            </button>
        </form>
    );
}

// ─── OTP — code step ──────────────────────────────────────────────────────────

function OtpCodeStep({
    email,
    onSuccess,
    onBack,
}: {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(60);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await verifyOtp({ email, code });
        setLoading(false);

        if (res?.validationErrors?._errors?.length) {
            toast.error(res.validationErrors._errors[0]);
            return;
        }
        if (res?.serverError) {
            toast.error('Erreur serveur. Réessayez.');
            return;
        }
        onSuccess();
    }

    async function handleResend() {
        setResending(true);
        const res = await sendOtp({ email });
        setResending(false);
        if (res?.validationErrors?._errors?.length) {
            toast.error(res.validationErrors._errors[0]);
        } else {
            toast.success('Nouveau code envoyé !');
            setCooldown(60);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <p className="text-[13px] text-muted-foreground mb-5">
                    Code envoyé à{' '}
                    <strong className="text-foreground font-semibold">
                        {email}
                    </strong>
                </p>
                <label
                    htmlFor="otp-code"
                    className="block text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60 mb-3"
                >
                    Code à 6 chiffres
                </label>
                <input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className={cn(
                        inputClass,
                        'text-center text-[28px] tracking-[0.4em] font-mono font-semibold'
                    )}
                />
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-12"
                disabled={loading || code.length !== 6}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Vérification…
                    </>
                ) : (
                    'Se connecter'
                )}
            </Button>

            <div className="flex items-center justify-between text-[12.5px]">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Changer d&apos;email
                </button>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resending}
                    className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {cooldown > 0
                        ? `Renvoyer (${cooldown}s)`
                        : resending
                          ? 'Envoi…'
                          : 'Renvoyer le code'}
                </button>
            </div>
        </form>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SignInPage() {
    const [tab, setTab] = useState<AuthTab>('oauth');
    const [otpEmail, setOtpEmail] = useState('');
    const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(
        null
    );
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = decodeURIComponent(searchParams.get('redirect') ?? '/');
    const oauthError = searchParams.get('error');

    useEffect(() => {
        if (oauthError) toast.error('Connexion OAuth échouée. Réessayez.');
    }, [oauthError]);

    function startOAuth(provider: OAuthProvider) {
        setOauthLoading(provider);
        window.location.href = `/api/auth/${provider}`;
    }

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel — branded dark with subtle pattern ─────── */}
            <div className="hidden md:flex relative w-[45%] shrink-0 flex-col bg-foreground text-background px-12 py-10 overflow-hidden">
                {/* Decorative grain — subtle radial primary glow */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        background:
                            'radial-gradient(circle at 30% 25%, var(--primary), transparent 55%)',
                    }}
                />
                {/* Decorative grid */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                    }}
                />

                <div className="relative">
                    <Link href="/" className="flex items-center gap-2 group">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-[15px] font-bold">Le Génie</span>
                    </Link>
                </div>

                {/* Tagline */}
                <div className="relative flex-1 flex items-center">
                    <div className="max-w-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-5">
                            Plateforme collaborative
                        </p>
                        <blockquote>
                            <p className="text-[32px] font-bold leading-[1.15] tracking-tight">
                                La connaissance prend de la valeur quand elle{' '}
                                <span className="text-primary">circule</span>.
                            </p>
                        </blockquote>
                        <p className="text-[13px] opacity-60 mt-6 leading-relaxed">
                            Rejoignez une communauté d&apos;auteurs et de
                            lecteurs qui apprennent ensemble — sans paywall,
                            sans publicité, sans bullshit.
                        </p>
                    </div>
                </div>

                <p className="relative text-[11px] opacity-40 tracking-wide">
                    Accès libre · Sans mot de passe · Open source
                </p>
            </div>

            {/* ── Right panel — auth form ───────────────────────────── */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-16 bg-background">
                <div className="w-full max-w-sm space-y-10">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 md:hidden">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Le Génie</span>
                    </div>

                    {/* Title */}
                    <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-primary mb-3">
                            Connexion
                        </p>
                        <h1 className="text-[32px] font-bold tracking-tight leading-[1.1] text-foreground">
                            {tab === 'oauth' && 'Bon retour.'}
                            {tab === 'otp-email' && 'Votre email.'}
                            {tab === 'otp-code' && 'Code de vérification.'}
                        </h1>
                        <p className="text-[13.5px] text-muted-foreground mt-2 leading-relaxed">
                            {tab === 'oauth' &&
                                'Connectez-vous via votre fournisseur OAuth ou recevez un code par email.'}
                            {tab === 'otp-email' &&
                                'Aucun mot de passe — on vous envoie un code à 6 chiffres.'}
                            {tab === 'otp-code' &&
                                'Saisissez le code reçu pour vous connecter.'}
                        </p>
                    </div>

                    {/* Auth content */}
                    {tab === 'oauth' && (
                        <OAuthButtons
                            loading={oauthLoading}
                            onOAuth={startOAuth}
                            onSwitchToOtp={() => setTab('otp-email')}
                        />
                    )}

                    {tab === 'otp-email' && (
                        <OtpEmailStep
                            onCodeSent={(email) => {
                                setOtpEmail(email);
                                setTab('otp-code');
                            }}
                            onBack={() => setTab('oauth')}
                        />
                    )}

                    {tab === 'otp-code' && (
                        <OtpCodeStep
                            email={otpEmail}
                            onSuccess={() => router.push(redirectTo)}
                            onBack={() => setTab('otp-email')}
                        />
                    )}

                    <p className="text-center text-[12.5px] text-muted-foreground">
                        Pas encore inscrit ?{' '}
                        <Link
                            href="/"
                            className="text-primary font-semibold hover:underline underline-offset-4"
                        >
                            Revenir à l&apos;accueil
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
