'use server'

import { cookies } from 'next/headers'
import { Env } from '@/libs/Env'
import { safeAction } from '@/libs/safe-action'
import { z } from 'zod'
import { returnValidationErrors } from 'next-safe-action'

const tokenSchema = z.object({
  code: z.string(),
  provider: z.enum(['GOOGLE', 'GITHUB']),
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
    const jar = await cookies()

    jar.set('access_token', accessToken, {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      path: '/',
      maxAge: 15 * 60,
      sameSite: 'lax',
    })

    jar.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })

    return { success: true }
  })
