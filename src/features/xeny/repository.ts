import { prisma } from '@src/lib/db'

export class UserXenyRepository {
  protected prisma = prisma

  async getOrCreateByUserId(userId: number): Promise<any> {
    // @ts-ignore
    let userXeny = await this.prisma.userXeny.findUnique({
      where: { userId },
    })

    if (!userXeny) {
      // @ts-ignore
      userXeny = await this.prisma.userXeny.create({
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
}

export class XenyTransactionRepository {
  protected prisma = prisma

  async getUserTransactions(
    userId: number,
    limit: number = 10,
    offset: number = 0
  ) {
    // @ts-ignore
    const [transactions, total] = await Promise.all([
      // @ts-ignore
      this.prisma.xenyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      // @ts-ignore
      this.prisma.xenyTransaction.count({
        where: { userId },
      }),
    ])

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    }
  }
}

// Export singleton instances
export const userXenyRepository = new UserXenyRepository()
export const xenyTransactionRepository = new XenyTransactionRepository()
