import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Ctx = { params: Promise<{ id: string; commentId: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id, commentId } = await params
  return proxyRequest(req, `posts/${id}/comments/${commentId}`)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id, commentId } = await params
  return proxyRequest(req, `posts/${id}/comments/${commentId}`)
}
