import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

export function apiMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Group 1: Public API
  if (path.startsWith('/api/public')) {
    return NextResponse.next()
  }

  // Group 2: Member API
  // if (path.startsWith("/api/member")) {
  //     return memberApiMiddleware(req)
  // }

  // Group 3: User API
  // if (path.startsWith("/api/user")) {
  //     return userApiMiddleware(req)
  // }

  // Default API middleware
  return defaultApiMiddleware(req)
}

async function memberApiMiddleware(req: NextRequest) {
  const token = await getToken({ req })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = token.role

  if (role !== 'member') {
    return NextResponse.json(
      { error: 'Member privileges required' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

async function userApiMiddleware(req: NextRequest) {
  const token = await getToken({ req })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = token.role

  if (role !== 'user') {
    return NextResponse.json(
      { error: 'User privileges required' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

async function defaultApiMiddleware(req: NextRequest) {
  const token = await getToken({ req })

  // if (!token) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  return NextResponse.next()
}
