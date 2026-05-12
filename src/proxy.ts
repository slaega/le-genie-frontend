import { routing } from '@/libs/i18nNavigation';
import { createRouteMatcher } from '@/utils/Helpers';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
    '/:locale/post/:post/edit',
    '/:locale/me(.*)',
]);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Static files — pass through
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get('access_token')?.value;

    // For /api/* requests: inject Authorization header so NestJS receives it
    // via the next.config.ts rewrite proxy (no fetch, no latency)
    if (pathname.startsWith('/api/')) {
        if (!accessToken) return NextResponse.next();
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        return NextResponse.next({ request: { headers } });
    }

    // Protected pages — redirect to sign-in if no session
    if (isProtectedRoute(request) && !accessToken) {
        const locale = pathname.match(/^\/([^/]+)/)?.[1] ?? '';
        const pathWithoutLocale = pathname.startsWith(`/${locale}`)
            ? pathname.slice(`/${locale}`.length) || '/'
            : pathname;

        const redirectUrl = new URL(`/${locale}/auth/sign-in`, request.url);
        redirectUrl.searchParams.set(
            'redirect',
            encodeURIComponent(pathWithoutLocale + request.nextUrl.search)
        );

        const res = NextResponse.redirect(redirectUrl);
        res.cookies.delete('access_token');
        res.cookies.delete('refresh_token');
        return res;
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
