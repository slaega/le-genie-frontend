import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api/server'
import { ApiError, type User, type Resume } from '@/lib/api/types'
import { MainLayout } from '@/components/templates/main-layout'
import { CvEditor } from '@/components/organisms/cv-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mon CV — Le Génie' }

type Props = { params: Promise<{ locale: string }> }

export default async function MyCvPage({ params }: Props) {
  const { locale } = await params

  let me: User
  try {
    me = await serverApi.get<User>('auth/me')
  } catch (err) {
    if (err instanceof ApiError) redirect(`/${locale}/auth/sign-in`)
    throw err
  }

  const resume = await serverApi.get<Resume>('resume/me').catch(() => ({
    id: '',
    userId: me.id,
    templateId: 'minimal-light' as const,
    isPublic: true,
    data: {},
    createdAt: '',
    updatedAt: '',
  }))

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <CvEditor initial={resume} userId={me.id} locale={locale} />
      </div>
    </MainLayout>
  )
}
