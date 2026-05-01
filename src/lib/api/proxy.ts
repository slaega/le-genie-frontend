import 'server-only'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const NestJS = process.env.API_BASE_URL ?? ''

export async function proxyRequest(
  req: NextRequest,
  apiPath: string,
  method?: string,
): Promise<NextResponse> {
  const jar = await cookies()
  const accessToken = jar.get('access_token')?.value

  const m = method ?? req.method
  const contentType = req.headers.get('content-type') ?? ''
  const isForm = contentType.includes('multipart/form-data')

  const headers: HeadersInit = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(!isForm ? { 'Content-Type': 'application/json' } : {}),
  }

  let body: BodyInit | null = null
  if (m !== 'GET' && m !== 'DELETE' && m !== 'HEAD') {
    body = isForm ? await req.formData() : await req.text()
  }

  const url = `${NestJS}${apiPath}`
  const res = await fetch(url, { method: m, headers, body })

  const resContentType = res.headers.get('content-type') ?? ''
  if (res.status === 204) return new NextResponse(null, { status: 204 })

  if (resContentType.includes('application/json')) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  const text = await res.text()
  return new NextResponse(text, { status: res.status })
}
