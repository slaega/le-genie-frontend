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
import { Env } from '@/libs/Env';

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'MICROSOFT';
type AuthTab = 'oauth' | 'otp-email' | 'otp-code';

// ─── OAuth URL builder ────────────────────────────────────────────────────────

function buildOAuthUrl(provider: OAuthProvider): string {
    const callbackUri = encodeURIComponent(Env.NEXT_PUBLIC_REDIRECT_URI);

    switch (provider) {
        case 'GOOGLE':
            return (
                `https://accounts.google.com/o/oauth2/v2/auth` +
                `?client_id=${Env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
                `&redirect_uri=${callbackUri}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent('openid email profile')}` +
                `&state=GOOGLE`
            );
        case 'GITHUB':
            return (
                `https://github.com/login/oauth/authorize` +
                `?client_id=${Env.NEXT_PUBLIC_GITHUB_CLIENT_ID}` +
                `&redirect_uri=${callbackUri}` +
                `&scope=${encodeURIComponent('user:email')}` +
                `&state=GITHUB`
            );
        case 'MICROSOFT':
            return (
                `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
                `?client_id=${Env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}` +
                `&redirect_uri=${callbackUri}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent('openid email profile')}` +
                `&state=MICROSOFT` +
                `&response_mode=query`
            );
    }
}

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
                onClick={() => onOAuth('GOOGLE')}
            >
                {loading === 'GOOGLE' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Globe className="h-4 w-4" />
                )}
                {loading === 'GOOGLE'
                    ? 'Redirection...'
                    : 'Continuer avec Google'}
            </Button>

            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={() => onOAuth('GITHUB')}
            >
                {loading === 'GITHUB' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Github className="h-4 w-4" />
                )}
                {loading === 'GITHUB'
                    ? 'Redirection...'
                    : 'Continuer avec GitHub'}
            </Button>

            <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                disabled={!!loading}
                onClick={() => onOAuth('MICROSOFT')}
            >
                {loading === 'MICROSOFT' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MicrosoftIcon className="h-4 w-4" />
                )}
                {loading === 'MICROSOFT'
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

    // Surface OAuth errors forwarded by the callback route
    useEffect(() => {
        if (oauthError) toast.error('Connexion OAuth échouée. Réessayez.');
    }, [oauthError]);

    // Navigate the current window to the OAuth provider — no popup needed
    function startOAuth(provider: OAuthProvider) {
        setOauthLoading(provider);
        window.location.href = buildOAuthUrl(provider);
    }

    return (
        <div className="min-h-screen flex">
            {/* Form panel */}
            <div className="w-full max-w-md flex flex-col justify-center px-10 py-16 bg-background border-r">
                <div className="space-y-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Le Génie</span>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
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

            {/* Hero panel */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-16 bg-muted/30">
                <blockquote className="max-w-md space-y-4">
                    <p className="text-2xl font-semibold leading-relaxed">
                        &ldquo;Partagez votre expertise avec une communauté de
                        passionnés.&rdquo;
                    </p>
                    <footer className="text-muted-foreground text-sm">
                        — L&apos;équipe Le Génie
                    </footer>
                </blockquote>
            </div>
        </div>
    );
}
