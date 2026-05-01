// middleware.ts
import { routing } from '@/libs/i18nNavigation';
import { createRouteMatcher } from '@/utils/Helpers';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Env } from './libs/Env';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
    '/:locale/post/:post/edit',
    '/:locale/me(.*)',
]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isAuthPage = createRouteMatcher(['/auth(.*)', '/:locale/auth(.*)']);

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Autoriser certains fichiers publics
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
        return NextResponse.next();
    }

    const matchProtected = isProtectedRoute(request);

    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const locale = pathname.match(/^(\/[^\/]+)/)?.[1] || '';

    // 2. Tentative de refresh si pas d'access_token et refresh_token présent
    if (!accessToken && refreshToken) {
        const response = await tryRefreshToken(refreshToken);
        if (response) {
            return response;
        }
    }

    // 3. Si page protégée et toujours pas d'access_token → redirection
    if (matchProtected && !accessToken) {
        const localePrefix = `${locale}`;
        let pathWithoutLocale = request.nextUrl.pathname;
        if (pathWithoutLocale.startsWith(localePrefix)) {
            pathWithoutLocale = pathWithoutLocale.slice(localePrefix.length);
            if (!pathWithoutLocale.startsWith('/')) {
                pathWithoutLocale = '/' + pathWithoutLocale;
            }
        }
        const redirectTo = encodeURIComponent(
            pathWithoutLocale + request.nextUrl.search
        );

        const redirectUrl = new URL(`${locale}/auth/sign-in`, request.url);
        redirectUrl.searchParams.set('redirect', redirectTo);
        const res = NextResponse.redirect(redirectUrl);
        res.cookies.delete('access_token');
        res.cookies.delete('refresh_token');
        return res;
    }

    // 4. Laisser passer tout le reste
    return intlMiddleware(request);
}
async function tryRefreshToken(
    refreshToken: string
): Promise<NextResponse | null> {
    try {
        const refreshRes = await fetch(
            `${Env.API_BASE_URL}auth/refresh-token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${refreshToken}`,
                },
            }
        );

        if (!refreshRes.ok) return null;

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshRes.json();
        const response = NextResponse.next();

        response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        });
        const maxAge = 60 * 60 * 24 * 7;
        response.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge,
        });

        return response;
    } catch (err) {
        console.error('[middleware] Refresh token failed:', err);
        return null;
    }
}

export const config = {
    matcher: [
        // On évite _next, fichiers statiques, etc.
        '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Toujours exécuter pour API routes
        '/(api|trpc)(.*)',
    ],
};
