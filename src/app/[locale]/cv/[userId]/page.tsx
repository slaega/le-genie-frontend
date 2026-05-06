import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api/server'
import { ApiError, type Resume } from '@/lib/api/types'
import { CvTemplate } from '@/components/organisms/cv-templates'
import type { Metadata } from 'next'

type Props = { params: Promise<{ userId: string; locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  try {
    const resume = await serverApi.get<Resume>(`resume/${userId}`)
    const name = resume.user?.name ?? resume.data.personal?.fullName ?? 'CV'
    return {
      title: `CV de ${name} — Le Génie`,
      description: resume.data.personal?.summary ?? undefined,
    }
  } catch {
    return { title: 'CV — Le Génie' }
  }
}

export default async function PublicCvPage({ params }: Props) {
  const { userId } = await params

  let resume: Resume
  try {
    resume = await serverApi.get<Resume>(`resume/${userId}`)
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound()
    }
    throw err
  }

  const ownerName = resume.user?.name ?? resume.data.personal?.fullName ?? 'Auteur'

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Print button */}
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border rounded shadow-sm text-sm hover:bg-gray-50 transition-colors"
          >
            Imprimer / Télécharger PDF
          </button>
        </div>

        {/* CV rendering */}
        <div className="shadow-2xl print:shadow-none">
          <CvTemplate templateId={resume.templateId} data={resume.data} />
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-sm text-muted-foreground print:hidden">
          CV de{' '}
          <a href={`/authors/${userId}`} className="underline hover:text-foreground">
            {ownerName}
          </a>{' '}
          — partagé via{' '}
          <a href="/" className="underline hover:text-foreground">
            Le Génie
          </a>
        </p>
      </div>
    </div>
  )
}
