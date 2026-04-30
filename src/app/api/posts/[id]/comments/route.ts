import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const qs = req.nextUrl.search
  return proxyRequest(req, `posts/${id}/comments${qs}`)
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  return proxyRequest(req, `posts/${id}/comments`)
}
