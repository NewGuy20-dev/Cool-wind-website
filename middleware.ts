import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect any remaining /ml or /en prefixed URLs to root
  if (request.nextUrl.pathname.startsWith('/ml/') || request.nextUrl.pathname.startsWith('/en/')) {
    const newPath = request.nextUrl.pathname.replace(/^\/(ml|en)/, '') || '/'
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
