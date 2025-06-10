// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@src/lib/db'
import { getToken } from 'next-auth/jwt'

export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith('/auth')
  const isCreatePage = path === '/create'

  if (!token && !isAuthPage && !isCreatePage) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  if (token && !isAuthPage && !isCreatePage) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(token.id) },
      })

      if (!existingUser) {
        // ลบ cookies และ redirect ตรงๆ
        const response = NextResponse.redirect(new URL('/create', req.url))

        // ลบ NextAuth cookies
        response.cookies.delete('next-auth.session-token')
        response.cookies.delete('__Secure-next-auth.session-token')
        response.cookies.delete('next-auth.csrf-token')
        response.cookies.delete('__Host-next-auth.csrf-token')

        return response
      }
    } catch (error) {
      // ลบ cookies และ redirect เมื่อ error
      const response = NextResponse.redirect(new URL('/create', req.url))

      response.cookies.delete('next-auth.session-token')
      response.cookies.delete('__Secure-next-auth.session-token')
      response.cookies.delete('next-auth.csrf-token')
      response.cookies.delete('__Host-next-auth.csrf-token')

      return response
    }
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}
