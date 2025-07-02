import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { BaseService } from '@src/lib/services/server/baseService'

export class XenyService extends BaseService {
  private static instance: XenyService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!XenyService.instance) {
      XenyService.instance = new XenyService()
    }
    return XenyService.instance
  }

  // ดึงข้อมูล Xeny ของ user ปัจจุบัน
  async getUserXeny() {
    const session = await getServerSession()
    const userId = +session.user.id

    // @ts-ignore
    let userXeny = await prisma.userXeny.findUnique({
      where: { userId },
    })

    if (!userXeny) {
      // @ts-ignore
      userXeny = await prisma.userXeny.create({
        data: {
          userId,
          currentXeny: 0,
          totalEarnedXeny: 0,
          totalSpentXeny: 0,
        },
      })
    }

    return userXeny
  }

  // เพิ่ม Xeny
  async addXeny(amount: number, type: string, description?: string, referenceId?: number, referenceType?: string) {
    const session = await getServerSession()
    const userId = +session.user.id

    const result = await prisma.$transaction(async (tx) => {
      // ดึง character ของ user
      const character = await tx.character.findUnique({
        where: { userId },
      })

      // @ts-ignore
      let userXeny = await tx.userXeny.findUnique({
        where: { userId },
      })

      if (!userXeny) {
        // @ts-ignore
        userXeny = await tx.userXeny.create({
          data: {
            userId,
            currentXeny: amount,
            totalEarnedXeny: amount,
            totalSpentXeny: 0,
          },
        })
      } else {
        // @ts-ignore
        userXeny = await tx.userXeny.update({
          where: { userId },
          data: {
            currentXeny: { increment: amount },
            totalEarnedXeny: { increment: amount },
          },
        })
      }

      // สร้าง transaction record
      // @ts-ignore
      await tx.xenyTransaction.create({
        data: {
          userId,
          characterId: character?.id || 0,
          amount,
          type: type as any,
          description,
          referenceId,
          referenceType,
          balanceBefore: userXeny.currentXeny - amount,
          balanceAfter: userXeny.currentXeny,
        },
      })

      return userXeny
    })

    return result
  }

  // ใช้ Xeny
  async useXeny(amount: number, type: string, description?: string, referenceId?: number, referenceType?: string) {
    const session = await getServerSession()
    const userId = +session.user.id

    const result = await prisma.$transaction(async (tx) => {
      // ดึง character ของ user
      const character = await tx.character.findUnique({
        where: { userId },
      })

      // @ts-ignore
      const userXeny = await tx.userXeny.findUnique({
        where: { userId },
      })

      if (!userXeny || userXeny.currentXeny < amount) {
        throw new Error('Insufficient Xeny')
      }

      // @ts-ignore
      const updatedUserXeny = await tx.userXeny.update({
        where: { userId },
        data: {
          currentXeny: { decrement: amount },
          totalSpentXeny: { increment: amount },
        },
      })

      // สร้าง transaction record
      // @ts-ignore
      await tx.xenyTransaction.create({
        data: {
          userId,
          characterId: character?.id || 0,
          amount: -amount,
          type: type as any,
          description,
          referenceId,
          referenceType,
          balanceBefore: userXeny.currentXeny,
          balanceAfter: updatedUserXeny.currentXeny,
        },
      })

      return updatedUserXeny
    })

    return result
  }

  // ดึงประวัติ Xeny transactions
  async getXenyTransactions(limit: number = 10, offset: number = 0) {
    const session = await getServerSession()
    const userId = +session.user.id

    // @ts-ignore
    const [transactions, total] = await Promise.all([
      // @ts-ignore
      prisma.xenyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      // @ts-ignore
      prisma.xenyTransaction.count({
        where: { userId },
      }),
    ])

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    }
  }

  // แลก Token เป็น Xeny
  async exchangeTokenToXeny(tokenAmount: number, exchangeRate: number = 10) {
    const session = await getServerSession()
    const userId = +session.user.id
    const xenyAmount = tokenAmount * exchangeRate

    const result = await prisma.$transaction(async (tx) => {
      // ดึง character ของ user
      const character = await tx.character.findUnique({
        where: { userId },
      })

      // ตรวจสอบ token
      const userToken = await tx.userToken.findUnique({
        where: { userId },
      })

      if (!userToken || userToken.currentTokens < tokenAmount) {
        throw new Error('Insufficient tokens')
      }

      // หัก token
      const updatedUserToken = await tx.userToken.update({
        where: { userId },
        data: {
          currentTokens: { decrement: tokenAmount },
          totalSpentTokens: { increment: tokenAmount },
        },
      })

      // เพิ่ม Xeny
      // @ts-ignore
      let userXeny = await tx.userXeny.findUnique({
        where: { userId },
      })

      if (!userXeny) {
        // @ts-ignore
        userXeny = await tx.userXeny.create({
          data: {
            userId,
            currentXeny: xenyAmount,
            totalEarnedXeny: xenyAmount,
            totalSpentXeny: 0,
          },
        })
      } else {
        // @ts-ignore
        userXeny = await tx.userXeny.update({
          where: { userId },
          data: {
            currentXeny: { increment: xenyAmount },
            totalEarnedXeny: { increment: xenyAmount },
          },
        })
      }

      // สร้าง token transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          characterId: character?.id || 0,
          amount: -tokenAmount,
          type: 'shop_purchase',
          description: `Exchanged ${tokenAmount} tokens for ${xenyAmount} Xeny`,
          balanceBefore: userToken.currentTokens,
          balanceAfter: updatedUserToken.currentTokens,
        },
      })

      // สร้าง xeny transaction
      // @ts-ignore
      await tx.xenyTransaction.create({
        data: {
          userId,
          characterId: character?.id || 0,
          amount: xenyAmount,
          type: 'exchange_from_token',
          description: `Received ${xenyAmount} Xeny from ${tokenAmount} tokens exchange`,
          balanceBefore: userXeny.currentXeny - xenyAmount,
          balanceAfter: userXeny.currentXeny,
        },
      })

      return {
        userToken: updatedUserToken,
        userXeny,
        exchangeDetails: {
          tokensUsed: tokenAmount,
          xenyReceived: xenyAmount,
          exchangeRate,
        },
      }
    })

    return result
  }
}

export const xenyService = XenyService.getInstance() 