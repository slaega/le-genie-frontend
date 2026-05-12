'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    BookOpen,
    Github,
    Globe,
    Loader2,
    Mail,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createToken, sendOtp, verifyOtp } from '@/app/actions/auth';
import { Env } from '@/libs/Env';

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'MICROSOFT';
type AuthTab = 'oauth' | 'otp-email' | 'otp-code';

let oauthPopup: Window | null = null;

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
                    ? 'Connexion...'
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
                    ? 'Connexion...'
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
                    ? 'Connexion...'
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

// ─── OTP email step ───────────────────────────────────────────────────────────

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

// ─── OTP code step ────────────────────────────────────────────────────────────

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
    const redirect = decodeURIComponent(searchParams.get('redirect') ?? '/');
    const handledRef = useRef(false);

    const exchangeCode = useCallback(
        async (provider: OAuthProvider, code: string) => {
            const res = await createToken({ code, provider });
            const target = window.opener ? window : null;

            if (res?.data?.success) {
                target?.postMessage?.(
                    { type: 'OAUTH_SUCCESS' },
                    window.location.origin
                );
                if (window.opener) window.close();
                return;
            }

            const message =
                res?.validationErrors?._errors?.join(', ') ??
                'Une erreur est survenue.';
            target?.postMessage?.(
                { type: 'OAUTH_ERROR', message },
                window.location.origin
            );
            if (window.opener) window.close();
        },
        []
    );

    // Handle OAuth callback when this page is the popup target
    useEffect(() => {
        if (handledRef.current) return;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        if (code && state) {
            handledRef.current = true;
            exchangeCode(state as OAuthProvider, code);
        }
    }, [exchangeCode]);

    // Listen for messages from popup
    useEffect(() => {
        function onMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return;
            if (event.data.type === 'OAUTH_SUCCESS') router.push(redirect);
            if (event.data.type === 'OAUTH_ERROR') {
                toast.error(event.data.message ?? 'Erreur de connexion');
                setOauthLoading(null);
            }
        }
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [redirect, router]);

    function openOAuth(provider: OAuthProvider) {
        setOauthLoading(provider);
        const redirectUri = encodeURIComponent(Env.NEXT_PUBLIC_REDIRECT_URI);
        const urls: Record<OAuthProvider, string> = {
            GOOGLE:
                `https://accounts.google.com/o/oauth2/v2/auth` +
                `?client_id=${Env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}` +
                `&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=GOOGLE`,
            GITHUB:
                `https://github.com/login/oauth/authorize` +
                `?client_id=${Env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}` +
                `&scope=${encodeURIComponent('user:email')}&state=GITHUB`,
            MICROSOFT:
                `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
                `?client_id=${Env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&redirect_uri=${redirectUri}` +
                `&response_type=code&scope=${encodeURIComponent('openid email profile')}` +
                `&state=MICROSOFT&response_mode=query`,
        };

        const w = 600,
            h = 650;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;
        const features = `width=${w},height=${h},left=${left},top=${top},resizable,scrollbars=yes`;

        if (oauthPopup && !oauthPopup.closed) {
            oauthPopup.location.href = urls[provider];
            oauthPopup.focus();
        } else {
            oauthPopup = window.open(urls[provider], 'OAuthLogin', features);
        }
    }

    function handleOtpCodeSent(email: string) {
        setOtpEmail(email);
        setTab('otp-code');
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
                            onOAuth={openOAuth}
                            onSwitchToOtp={() => setTab('otp-email')}
                        />
                    )}

                    {tab === 'otp-email' && (
                        <OtpEmailStep
                            onCodeSent={handleOtpCodeSent}
                            onBack={() => setTab('oauth')}
                        />
                    )}

                    {tab === 'otp-code' && (
                        <OtpCodeStep
                            email={otpEmail}
                            onSuccess={() => router.push(redirect)}
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
