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
        const userData = {} as User

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

          userData.id = firstUser.id.toString()
          userData.name = firstUser.username
          userData.email = firstUser.email
          userData.username = firstUser.username
          userData.avatar = firstUser.avatar

          return userData
        }

        // Production login logic
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username: credentials.username }],
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

        userData.id = user.id.toString()
        userData.name = user.username
        userData.email = user.email
        userData.username = user.username
        userData.avatar = user.avatar

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
        token.avatar = user.avatar
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
          avatar: token.avatar,
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

// export async function getDevSession() {
//   if (process.env.NODE_ENV === 'development') {
//     const userData = {} as User

//     const firstUser = await prisma.user.findFirst({
//       orderBy: { id: 'asc' },
//     })

//     if (!firstUser) return null

//     userData.id = firstUser.id.toString()
//     userData.name = firstUser.username
//     userData.email = firstUser.email
//     userData.username = firstUser.username
//     userData.avatar = firstUser.avatar

//     console.log(userData)
//     return userData
//   }
// }

export async function getDevSession(): Promise<Session | null> {
  if (process.env.NODE_ENV === 'development') {
    const firstUser = await prisma.user.findFirst({
      orderBy: { id: 'asc' },
    })

    if (!firstUser) return null

    const session: Session = {
      user: {
        id: firstUser.id.toString(),
        name: firstUser.username,
        email: firstUser.email,
        username: firstUser.username,
        avatar: firstUser.avatar,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 วัน
    }

    return session
  }

  return null
}
