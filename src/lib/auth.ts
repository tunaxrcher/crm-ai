import { prisma } from '@src/lib/db'
import { compare } from 'bcrypt'
import { NextAuthOptions, Session, User } from 'next-auth'
import { getServerSession as getSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'

const isDev = process.env.NODE_ENV === 'development'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 🚀 Development Mode: Always login as first user
        if (isDev) {
          console.log('🔧 [DEV MODE] Auto login as first user')

          const firstUser = await prisma.user.findFirst({
            orderBy: { id: 'asc' },
          })

          if (!firstUser) {
            console.log('❌ [DEV MODE] No users found in database')
            return null
          }

          console.log(
            `✅ [DEV MODE] Logged in as: ${firstUser.name} (${firstUser.email})`
          )

          return {
            id: firstUser.id.toString(),
            name: firstUser.name,
            email: firstUser.email,
            username: firstUser.username,
            avatar: firstUser.avatar,
          }
        }

        // Production login logic
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username },
            ],
          },
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

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        }
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
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          username: token.username as string,
          avatar: token.avatar as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
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
