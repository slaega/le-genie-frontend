import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api/server'
import type { User } from '@/lib/api/types'
import { ApiError } from '@/lib/api/types'
import { AdminSidebar } from '@/components/templates/admin-sidebar'

export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params

  let me: User
  try {
    me = await serverApi.get<User>('auth/me')
  } catch (err) {
    if (err instanceof ApiError) redirect(`/${locale}/auth/sign-in`)
    throw err
  }

  if (me.role !== 'ADMIN') {
    redirect(`/${locale}`)
  }

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      <AdminSidebar user={me} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
