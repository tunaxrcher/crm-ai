import { NextRequest, NextResponse } from 'next/server'

import { apiMiddleware } from './middleware/api'
import { authMiddleware } from './middleware/auth'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // เช็คว่าเป็น API route หรือไม่
  if (path.startsWith('/api')) {
    if (path.startsWith('/api/auth')) {
      return NextResponse.next()
    }
    return apiMiddleware(req)
  }

  return authMiddleware(req)
}

// Define which routes to apply this middleware
export const config = {
  matcher: [
    // Apply to all routes except specific ones
    '/((?!_next|static|.*\\..*|favicon.ico).*)',

    // Alternative approach with explicit routes
    '/auth/login',
    '/api/:path*',
  ],
}
