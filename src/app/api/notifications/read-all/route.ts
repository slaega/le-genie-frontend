import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'notifications/read-all', 'PATCH')
}
