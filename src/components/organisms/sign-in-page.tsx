'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    BookOpen,
    Github,
    Globe,
    Loader2,
    Mail,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { sendOtp, verifyOtp } from '@/app/actions/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthProvider = 'github' | 'google' | 'microsoft';
type AuthTab = 'oauth' | 'otp-email' | 'otp-code';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── OAuth buttons ────────────────────────────────────────────────────────────

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
            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={() => onOAuth('google')}
            >
                {loading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Globe className="h-4 w-4" />
                )}
                {loading === 'google'
                    ? 'Redirection...'
                    : 'Continuer avec Google'}
            </Button>

            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={() => onOAuth('github')}
            >
                {loading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Github className="h-4 w-4" />
                )}
                {loading === 'github'
                    ? 'Redirection...'
                    : 'Continuer avec GitHub'}
            </Button>

            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={() => onOAuth('microsoft')}
            >
                {loading === 'microsoft' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MicrosoftIcon className="h-4 w-4" />
                )}
                {loading === 'microsoft'
                    ? 'Redirection...'
                    : 'Continuer avec Microsoft'}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        ou
                    </span>
                </div>
            </div>

            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={onSwitchToOtp}
            >
                <Mail className="h-4 w-4" />
                Continuer avec un code email
            </Button>
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="otp-email">
                    Adresse email
                </label>
                <Input
                    id="otp-email"
                    type="email"
                    placeholder="vous@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                />
                <p className="text-xs text-muted-foreground">
                    Un code à 6 chiffres valable 5 minutes vous sera envoyé.
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Envoi...
                    </>
                ) : (
                    'Envoyer le code'
                )}
            </Button>

            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    Code envoyé à{' '}
                    <strong className="text-foreground">{email}</strong>
                </p>
                <label className="text-sm font-medium" htmlFor="otp-code">
                    Code à 6 chiffres
                </label>
                <Input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Vérification...
                    </>
                ) : (
                    'Se connecter'
                )}
            </Button>

            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Changer d&apos;email
                </button>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resending}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {cooldown > 0
                        ? `Renvoyer (${cooldown}s)`
                        : resending
                          ? 'Envoi...'
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

    // Surface errors forwarded by the NestJS social callback
    useEffect(() => {
        if (oauthError) toast.error('Connexion OAuth échouée. Réessayez.');
    }, [oauthError]);

    /**
     * Redirect the current window to NestJS via the Next.js proxy.
     * NestJS handles the full OAuth dance and sets httpOnly cookies.
     * The browser never sees port 3030.
     */
    function startOAuth(provider: OAuthProvider) {
        setOauthLoading(provider);
        window.location.href = `/api/auth/${provider}`;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left panel — inverted (dark in light mode, light in dark mode) */}
            <div className="hidden md:flex w-[45%] shrink-0 flex-col bg-foreground text-background px-12 py-10">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-base font-bold">Le Génie</span>
                </div>

                {/* Tagline — centered */}
                <div className="flex-1 flex items-center">
                    <blockquote className="max-w-sm">
                        <p className="text-3xl font-semibold italic leading-snug opacity-90">
                            &ldquo;La connaissance prend de la valeur quand
                            elle circule.&rdquo;
                        </p>
                    </blockquote>
                </div>

                {/* Bottom stats */}
                <p className="text-xs opacity-40 tracking-wide">
                    Plateforme collaborative · Accès libre · Sans mot de passe
                </p>
            </div>

            {/* Right panel — auth form */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 md:hidden">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Le Génie</span>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Connexion
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {tab === 'oauth' &&
                                'Sans mot de passe — via OAuth ou code email'}
                            {tab === 'otp-email' &&
                                'Entrez votre adresse email'}
                            {tab === 'otp-code' &&
                                'Entrez votre code de connexion'}
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

                    <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{' '}
                        <Link
                            href="/"
                            className="text-primary hover:underline underline-offset-4"
                        >
                            Revenir à l&apos;accueil
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
