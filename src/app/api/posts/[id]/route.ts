import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  return proxyRequest(req, `posts/${id}`)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  return proxyRequest(req, `posts/${id}`)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  return proxyRequest(req, `posts/${id}`)
}
