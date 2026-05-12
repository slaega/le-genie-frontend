/**
 * POST /api/auth/refresh
 *
 * Called client-side when a request fails with 401.
 * Reads the refresh_token cookie, exchanges it with the NestJS API,
 * and sets fresh httpOnly cookies — all inside the Node.js runtime
 * (NOT Edge middleware, so env vars and full Node APIs are available).
 */
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SECURE = process.env.NODE_ENV === 'production';

export async function POST(_req: NextRequest) {
    const jar = await cookies();
    const refreshToken = jar.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { error: 'No refresh token' },
            { status: 401 }
        );
    }

    const apiRes = await fetch(
        `${process.env.API_BASE_URL}auth/refresh-token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshToken}`,
            },
        }
    );

    if (!apiRes.ok) {
        const res = NextResponse.json(
            { error: 'Refresh failed' },
            { status: 401 }
        );
        res.cookies.delete('access_token');
        res.cookies.delete('refresh_token');
        return res;
    }

    const { accessToken, refreshToken: newRefresh } = await apiRes.json();

    const res = NextResponse.json({ ok: true });
    res.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
    });
    res.cookies.set('refresh_token', newRefresh, {
        httpOnly: true,
        secure: SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
    return res;
}
