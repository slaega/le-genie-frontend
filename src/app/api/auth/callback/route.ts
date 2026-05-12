/**
 * GET /api/auth/callback?code=...&state=GOOGLE|GITHUB|MICROSOFT
 *
 * OAuth callback — the provider redirects here after the user approves.
 * We exchange the code with NestJS, set httpOnly cookies, then redirect
 * the browser to the home page.  No client-side JS involved.
 */
import { type NextRequest, NextResponse } from 'next/server';

const SECURE = process.env.NODE_ENV === 'production';

export async function GET(req: NextRequest) {
    const { searchParams, origin } = req.nextUrl;

    const code = searchParams.get('code');
    const provider = searchParams.get('state'); // GOOGLE | GITHUB | MICROSOFT
    const error = searchParams.get('error'); // provider sent an error

    if (error || !code || !provider) {
        return NextResponse.redirect(
            new URL('/auth/sign-in?error=oauth_cancelled', origin)
        );
    }

    const apiRes = await fetch(`${process.env.API_BASE_URL}auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            provider,
            callbackURL: process.env.NEXT_PUBLIC_REDIRECT_URI,
        }),
        cache: 'no-store',
    });

    if (!apiRes.ok) {
        return NextResponse.redirect(
            new URL('/auth/sign-in?error=oauth_failed', origin)
        );
    }

    const { accessToken, refreshToken } = await apiRes.json();

    const response = NextResponse.redirect(new URL('/', origin));
    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
    });
    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
    return response;
}
