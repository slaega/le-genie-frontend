import { type NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'resume/me')
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'resume/me')
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'resume/me', 'DELETE')
}
