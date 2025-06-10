import { prisma } from '@src/lib/db'
import { compare } from 'bcrypt'
import { NextAuthOptions, Session, User } from 'next-auth'
import { getServerSession as getSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const userData = {} as User

        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
          include: { character: true },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        userData.id = user.id.toString()
        userData.name = user.username
        userData.email = user.email
        userData.username = user.username
        userData.avatar = user.character?.currentPortraitUrl
        userData.characterId = user.character?.id

        return userData
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.username = user.username
        token.currentPortraitUrl = user.currentPortraitUrl
        token.characterId = user.characterId
      } else {
        // Request ถัดไป - ตรวจสอบว่า user ยังอยู่ในฐานข้อมูลไหม
        if (token.id) {
          const existingUser = await prisma.user.findUnique({
            where: { id: Number(token.id) },
          })

          if (!existingUser) {
            // User ถูกลบแล้ว - ส่ง signal ให้ logout
            throw new Error('User not found in database')
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          username: token.username,
          currentPortraitUrl: token.currentPortraitUrl,
          characterId: token.characterId,
        }
      }

      return session
    },
  },
  pages: {
    signIn: '/create',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getServerSession() {
  return getSession(authOptions) as Promise<Session>
}
