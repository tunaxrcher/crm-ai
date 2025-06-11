import { prisma } from '@src/lib/db'
import { compare } from 'bcrypt'
import { NextAuthOptions, Session, User } from 'next-auth'
import { getServerSession as getSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// src/lib/auth.ts

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { character: true },
          })

          if (!existingUser) {
            // สร้าง user ใหม่ถ้ายังไม่มี
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                username: user.email!.split('@')[0], // ใช้ส่วนหน้า @ เป็น username
                avatar: user.image || null,
              },
            })
            user.id = newUser.id.toString()
          } else {
            user.id = existingUser.id.toString()
            user.characterId = existingUser.character?.id
          }
          return true
        } catch (error) {
          console.error('Error during Google sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.username = user.username
        token.currentPortraitUrl = user.currentPortraitUrl
        token.characterId = user.characterId
      }

      // **เพิ่มส่วนนี้** - Refresh token เมื่อมีการ update session
      if (trigger === 'update') {
        if (token.id) {
          const userData = await prisma.user.findUnique({
            where: { id: parseInt(token.id as string) },
            include: { character: true },
          })

          if (userData?.character) {
            token.characterId = userData.character.id
            token.currentPortraitUrl =
              userData.character.currentPortraitUrl || undefined
          }
        }
      }

      // ถ้า login ด้วย Google และยังไม่มีข้อมูล character ให้ดึงจาก database
      if (token.id && !token.characterId && trigger !== 'update') {
        const userData = await prisma.user.findUnique({
          where: { id: parseInt(token.id as string) },
          include: { character: true },
        })
        if (userData?.character) {
          token.characterId = userData.character.id
          token.currentPortraitUrl =
            userData.character.currentPortraitUrl || undefined
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
