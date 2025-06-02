// types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User extends BaseUser {}

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends BaseUser {}
}

interface BaseUser {
  id: string
  name?: string | null
  email?: string | null
  username: string
  avatar?: string | null
  characterId?: number
}
