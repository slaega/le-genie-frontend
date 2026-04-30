import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search
  return proxyRequest(req, `posts${qs}`)
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'posts')
}
