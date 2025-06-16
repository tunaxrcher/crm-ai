// src/features/reward/repository.ts
import {
  GachaHistory,
  RewardItem,
  RewardPurchase,
  UserRewardStats,
} from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

export class RewardRepository extends BaseRepository<RewardItem> {
  private static instance: RewardRepository

  public static getInstance() {
    if (!RewardRepository.instance) {
      RewardRepository.instance = new RewardRepository()
    }
    return RewardRepository.instance
  }

  async findAll() {
    return this.prisma.rewardItem.findMany()
  }

  async findById(id: number) {
    return this.prisma.rewardItem.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.rewardItem.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.rewardItem.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.rewardItem.delete({
      where: { id },
    })
  }

  // ดึงรายการ Reward ทั้งหมดที่ active
  async getActiveRewards() {
    return this.prisma.rewardItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        tokenCost: 'asc',
      },
    })
  }

  // ดึง Reward ตาม ID
  async getRewardById(id: number) {
    return this.prisma.rewardItem.findUnique({
      where: { id },
    })
  }

  // ตรวจสอบ stock
  async checkStock(rewardId: number): Promise<boolean> {
    const reward = await this.getRewardById(rewardId)
    if (!reward) return false
    if (reward.stock === null) return true // unlimited stock
    return reward.stock > 0
  }

  // ลด stock
  async decreaseStock(rewardId: number, quantity: number = 1) {
    const reward = await this.getRewardById(rewardId)
    if (!reward || reward.stock === null) return

    await this.prisma.rewardItem.update({
      where: { id: rewardId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    })
  }

  // ดึงรางวัลสำหรับ Gacha (ที่มี probability > 0)
  async getGachaRewards() {
    return this.prisma.rewardItem.findMany({
      where: {
        isActive: true,
        gachaProbability: {
          gt: 0,
        },
      },
      orderBy: {
        gachaProbability: 'desc',
      },
    })
  }
}

export const rewardRepository = RewardRepository.getInstance()

export class RewardPurchaseRepository extends BaseRepository<RewardPurchase> {
  private static instance: RewardPurchaseRepository

  public static getInstance() {
    if (!RewardPurchaseRepository.instance) {
      RewardPurchaseRepository.instance = new RewardPurchaseRepository()
    }
    return RewardPurchaseRepository.instance
  }

  async findAll() {
    return this.prisma.rewardPurchase.findMany()
  }

  async findById(id: number) {
    return this.prisma.rewardPurchase.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.rewardPurchase.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.rewardPurchase.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.rewardPurchase.delete({
      where: { id },
    })
  }

  // สร้างการซื้อ Reward
  async createPurchase(data: {
    characterId: number
    rewardItemId: number
    purchaseType: 'direct' | 'gacha'
    tokenSpent: number
    quantity?: number
    metadata?: any
  }) {
    return this.prisma.rewardPurchase.create({
      data: {
        characterId: data.characterId,
        rewardItemId: data.rewardItemId,
        purchaseType: data.purchaseType,
        tokenSpent: data.tokenSpent,
        quantity: data.quantity || 1,
        status: 'pending',
        metadata: data.metadata,
      },
      include: {
        rewardItem: true,
      },
    })
  }

  // ดึงประวัติการซื้อของ character
  async getCharacterPurchases(characterId: number) {
    return this.prisma.rewardPurchase.findMany({
      where: { characterId },
      include: {
        rewardItem: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // claim reward
  async claimReward(purchaseId: number) {
    return this.prisma.rewardPurchase.update({
      where: { id: purchaseId },
      data: {
        status: 'claimed',
        claimedAt: new Date(),
      },
    })
  }
}

export const rewardPurchaseRepository = RewardPurchaseRepository.getInstance()

export class GachaHistoryRepository extends BaseRepository<GachaHistory> {
  private static instance: GachaHistoryRepository

  public static getInstance() {
    if (!GachaHistoryRepository.instance) {
      GachaHistoryRepository.instance = new GachaHistoryRepository()
    }
    return GachaHistoryRepository.instance
  }

  async findAll() {
    return this.prisma.gachaHistory.findMany()
  }

  async findById(id: number) {
    return this.prisma.gachaHistory.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.gachaHistory.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.gachaHistory.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.gachaHistory.delete({
      where: { id },
    })
  }

  // บันทึกผลการ Gacha
  async createGachaResult(data: {
    characterId: number
    rewardItemId: number | null
    sessionId: string
    pullNumber: number
    tokenSpent: number
    isWin: boolean
  }) {
    return this.prisma.gachaHistory.create({
      data,
      include: {
        rewardItem: true,
      },
    })
  }

  // ดึงประวัติ Gacha ของ character
  async getCharacterGachaHistory(characterId: number, limit: number = 50) {
    return this.prisma.gachaHistory.findMany({
      where: { characterId },
      include: {
        rewardItem: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  // ดึงผล Gacha ตาม session
  async getGachaSession(sessionId: string) {
    return this.prisma.gachaHistory.findMany({
      where: { sessionId },
      include: {
        rewardItem: true,
      },
      orderBy: {
        pullNumber: 'asc',
      },
    })
  }
}

export const gachaHistoryRepository = GachaHistoryRepository.getInstance()

export class UserRewardStatsRepository extends BaseRepository<UserRewardStats> {
  private static instance: UserRewardStatsRepository

  public static getInstance() {
    if (!UserRewardStatsRepository.instance) {
      UserRewardStatsRepository.instance = new UserRewardStatsRepository()
    }
    return UserRewardStatsRepository.instance
  }

  async findAll() {
    return this.prisma.userRewardStats.findMany()
  }

  async findById(id: number) {
    return this.prisma.userRewardStats.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.userRewardStats.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.userRewardStats.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.userRewardStats.delete({
      where: { id },
    })
  }

  // ดึงหรือสร้าง stats ของ character
  async getOrCreateCharacterStats(characterId: number) {
    let stats = await this.prisma.userRewardStats.findUnique({
      where: { characterId },
    })

    if (!stats) {
      stats = await this.prisma.userRewardStats.create({
        data: { characterId },
      })
    }

    return stats
  }

  // อัปเดท stats หลังจาก gacha
  async updateGachaStats(
    characterId: number,
    isWin: boolean,
    tokenSpent: number
  ) {
    const stats = await this.getOrCreateCharacterStats(characterId)

    return this.prisma.userRewardStats.update({
      where: { characterId },
      data: {
        totalGachaPulls: { increment: 1 },
        totalGachaWins: isWin ? { increment: 1 } : undefined,
        totalTokensSpent: { increment: tokenSpent },
        lastGachaAt: new Date(),
        luckyStreak: isWin ? 0 : { increment: 1 },
      },
    })
  }

  // รีเซ็ต lucky streak
  async resetLuckyStreak(characterId: number) {
    return this.prisma.userRewardStats.update({
      where: { characterId },
      data: {
        luckyStreak: 0,
      },
    })
  }
}

export const userRewardStatsRepository = UserRewardStatsRepository.getInstance()
