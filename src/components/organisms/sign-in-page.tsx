'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Github, Globe, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createToken } from '@/app/actions/auth'
import { Env } from '@/libs/Env'

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'MICROSOFT'

let oauthPopup: Window | null = null

/** Microsoft "M" logo as inline SVG — no external dep needed */
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#00a4ef" />
      <rect x="1"  y="11" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}

export function SignInPage() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = decodeURIComponent(searchParams.get('redirect') ?? '/')
  const handledRef = useRef(false)

  const exchangeCode = useCallback(
    async (provider: OAuthProvider, code: string) => {
      const res = await createToken({ code, provider })

      if (res?.data?.success) {
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin)
          window.close()
        }
        return
      }

      const message = res?.validationErrors?._errors?.join(', ') ?? 'Une erreur est survenue.'
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_ERROR', message }, window.location.origin)
        window.close()
      }
    },
    [],
  )

  // Handle OAuth callback when this page is the popup target
  useEffect(() => {
    if (handledRef.current) return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (code && state) {
      handledRef.current = true
      exchangeCode(state as OAuthProvider, code)
    }
  }, [exchangeCode])

  // Listen for messages from popup when this page is the main window
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data.type === 'OAUTH_SUCCESS') {
        router.push(redirect)
      }
      if (event.data.type === 'OAUTH_ERROR') {
        toast.error(event.data.message ?? 'Erreur de connexion')
        setLoading(null)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [redirect, router])

  function openOAuth(provider: OAuthProvider) {
    setLoading(provider)

    const redirectUri = encodeURIComponent(Env.NEXT_PUBLIC_REDIRECT_URI)
    let url = ''

    if (provider === 'GOOGLE') {
      url =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${Env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&state=GOOGLE`
    } else if (provider === 'GITHUB') {
      url =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${Env.NEXT_PUBLIC_GITHUB_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${encodeURIComponent('user:email')}` +
        `&state=GITHUB`
    } else {
      // Microsoft Azure AD — common tenant (personal + work accounts)
      url =
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
        `?client_id=${Env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&state=MICROSOFT` +
        `&response_mode=query`
    }

    const w = 600, h = 650
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    const features = `width=${w},height=${h},left=${left},top=${top},resizable,scrollbars=yes`

    if (oauthPopup && !oauthPopup.closed) {
      oauthPopup.location.href = url
      oauthPopup.focus()
    } else {
      oauthPopup = window.open(url, 'OAuthLogin', features)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Form panel */}
      <div className="w-full max-w-md flex flex-col justify-center px-10 py-16 bg-background border-r">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Le Génie</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Connectez-vous avec Google, GitHub ou Microsoft
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full gap-3"
              variant="outline"
              size="lg"
              disabled={!!loading}
              onClick={() => openOAuth('GOOGLE')}
            >
              {loading === 'GOOGLE' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {loading === 'GOOGLE' ? 'Connexion...' : 'Continuer avec Google'}
            </Button>

            <Button
              className="w-full gap-3"
              variant="outline"
              size="lg"
              disabled={!!loading}
              onClick={() => openOAuth('GITHUB')}
            >
              {loading === 'GITHUB' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              {loading === 'GITHUB' ? 'Connexion...' : 'Continuer avec GitHub'}
            </Button>

            <Button
              className="w-full gap-3"
              variant="outline"
              size="lg"
              disabled={!!loading}
              onClick={() => openOAuth('MICROSOFT')}
            >
              {loading === 'MICROSOFT' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MicrosoftIcon className="h-4 w-4" />
              )}
              {loading === 'MICROSOFT' ? 'Connexion...' : 'Continuer avec Microsoft'}
            </Button>
          </div>

          <Separator />

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/" className="text-primary hover:underline underline-offset-4">
              Revenir à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>

      {/* Hero panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-16 bg-muted/30">
        <blockquote className="max-w-md space-y-4">
          <p className="text-2xl font-semibold leading-relaxed">
            &ldquo;Partagez votre expertise avec une communauté de passionnés.&rdquo;
          </p>
          <footer className="text-muted-foreground text-sm">
            — L&apos;équipe Le Génie
          </footer>
        </blockquote>
      </div>
    </div>
  )
}
