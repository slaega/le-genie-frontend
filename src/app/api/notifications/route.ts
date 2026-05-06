import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'notifications')
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'notifications', 'DELETE')
}
