import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Ctx = { params: Promise<{ id: string; invitationId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id, invitationId } = await params
  return proxyRequest(req, `posts/${id}/invitations/${invitationId}/resend`)
}
