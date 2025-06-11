import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith('/auth')

  // If user is not logged in and trying to access protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If user is logged in and trying to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Role-based access control
  if (token?.role === 'trials' && path.includes('/admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (token?.userType === 'member' && path.includes('/workspaces')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}
