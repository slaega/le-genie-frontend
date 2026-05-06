import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Params = { params: Promise<{ userId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { userId } = await params
  return proxyRequest(req, `resume/${userId}`)
}
