import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return proxyRequest(req, `notifications/${id}/read`, 'PATCH')
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  return proxyRequest(req, `notifications/${id}`, 'DELETE')
}
