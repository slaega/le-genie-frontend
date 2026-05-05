import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'auth/me/avatar', 'PATCH')
}
