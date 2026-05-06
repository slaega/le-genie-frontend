'use server'

import { cookies } from 'next/headers'
import { Env } from '@/libs/Env'
import { safeAction } from '@/libs/safe-action'
import { z } from 'zod'
import { returnValidationErrors } from 'next-safe-action'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies()
  const secure = Env.NODE_ENV === 'production'

  jar.set('access_token', accessToken, {
    httpOnly: true,
    secure,
    path: '/',
    maxAge: 15 * 60,
    sameSite: 'lax',
  })

  jar.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

const tokenSchema = z.object({
  code: z.string(),
  provider: z.enum(['GOOGLE', 'GITHUB', 'MICROSOFT']),
})

export const createToken = safeAction
  .inputSchema(tokenSchema)
  .action(async ({ parsedInput }) => {
    const { code, provider } = parsedInput

    const res = await fetch(`${Env.API_BASE_URL}auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, provider, callbackURL: Env.NEXT_PUBLIC_REDIRECT_URI }),
    })

    if (!res.ok) {
      return returnValidationErrors(tokenSchema, { _errors: ['Identifiants incorrects'] })
    }

    const { accessToken, refreshToken } = await res.json()
    await setAuthCookies(accessToken, refreshToken)
    return { success: true }
  })

// ─── OTP ──────────────────────────────────────────────────────────────────────

const sendOtpSchema = z.object({ email: z.string().email() })

export const sendOtp = safeAction
  .inputSchema(sendOtpSchema)
  .action(async ({ parsedInput }) => {
    const res = await fetch(`${Env.API_BASE_URL}auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: parsedInput.email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message = body?.message ?? 'Impossible d\'envoyer le code.'
      return returnValidationErrors(sendOtpSchema, { _errors: [message] })
    }

    return { success: true }
  })

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export const verifyOtp = safeAction
  .inputSchema(verifyOtpSchema)
  .action(async ({ parsedInput }) => {
    const res = await fetch(`${Env.API_BASE_URL}auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedInput),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message = body?.message ?? 'Code invalide ou expiré.'
      return returnValidationErrors(verifyOtpSchema, { _errors: [message] })
    }

    const { accessToken, refreshToken } = await res.json()
    await setAuthCookies(accessToken, refreshToken)
    return { success: true }
  })
