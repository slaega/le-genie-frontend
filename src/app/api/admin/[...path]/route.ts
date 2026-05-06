import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Params = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, { params }: Params) {
  const { path } = await params
  return proxyRequest(req, `admin/${path.join('/')}`)
}

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
