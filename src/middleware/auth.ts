// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith('/auth')
  const isCreatePage = path === '/create'

  // If user is not logged in and trying to access protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If user is logged in and trying to access login page
  if (token && isAuthPage) {
    // ตรวจสอบว่ามี character หรือยัง
    if (!token.characterId) {
      return NextResponse.redirect(new URL('/create', req.url))
    }

    return NextResponse.redirect(new URL('/', req.url))
  }

  // If user is logged in but doesn't have character and not on create page
  if (token && !token.characterId && !isCreatePage) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  // **เพิ่มส่วนนี้** - If user is logged in, has character, and trying to access create page
  if (token && token.characterId && isCreatePage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}
