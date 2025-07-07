// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith('/auth')
  const isCreatePage = path === '/create'

  // Handle unauthenticated users
  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return NextResponse.next()
  }

  // Handle authenticated users
  if (token) {
    // User is on auth page but already logged in
    if (isAuthPage) {
      const redirectUrl = token.characterId ? '/' : '/create'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }

    // User needs to create character
    if (!token.characterId && !isCreatePage) {
      return NextResponse.redirect(new URL('/create', req.url))
    }

    // User has character but trying to access create page
    if (token.characterId && isCreatePage) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}
