import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SignInPage } from '@/components/organisms/sign-in-page'

export const metadata: Metadata = {
  title: 'Connexion — Le Génie',
}

export default function AuthPage() {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  )
}
