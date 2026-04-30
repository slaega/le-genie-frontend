import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Ctx = { params: Promise<{ id: string; contributorId: string }> }

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id, contributorId } = await params
  return proxyRequest(req, `posts/${id}/contributors/${contributorId}`)
}
