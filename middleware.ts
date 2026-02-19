import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''

  // freeclaw.me → serve /clone as the homepage
  if (host.includes('freeclaw.me') && req.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/clone', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
