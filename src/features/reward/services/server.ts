// src/features/reward/services/server.ts
import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { BaseService } from '@src/lib/services/server/baseService'
import { v4 as uuidv4 } from 'uuid'

import {
  gachaHistoryRepository,
  rewardPurchaseRepository,
  rewardRepository,
  userRewardStatsRepository,
} from '../repository'

interface GachaResult {
  rewardId: number | null
  reward: any | null
  isWin: boolean
}

export class RewardService extends BaseService {
  private static instance: RewardService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService()
    }
    return RewardService.instance
  }

  // ดึง character ของ user ปัจจุบัน
  private async getCurrentCharacter() {
    const session = await getServerSession()
    const userId = +session.user.id

    const character = await prisma.character.findUnique({
      where: { userId },
      include: { user: true },
    })

    if (!character) {
      throw new Error('Character not found')
    }

    return character
  }

  // ดึงรายการ rewards ทั้งหมด
  async getRewards() {
    const character = await this.getCurrentCharacter()

    // ดึง rewards และ token ปัจจุบันของ user
    const [rewards, userToken] = await Promise.all([
      rewardRepository.getActiveRewards(),
      prisma.userToken.findUnique({
        where: { userId: character.userId },
      }),
    ])

    return {
      rewards,
      currentTokens: userToken?.currentTokens || 0,
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
      },
    }
  }

  // ดึงข้อมูลรางวัลและเปอร์เซ็นต์การออกของตู้กาชา
  async getGachaRates() {
    const character = await this.getCurrentCharacter()

    // ดึง rewards ที่สามารถได้จาก gacha
    const gachaRewards = await prisma.rewardItem.findMany({
      where: {
        isActive: true,
        gachaProbability: { gt: 0 },
      },
      orderBy: [{ rarity: 'desc' }, { gachaProbability: 'desc' }],
    })

    // คำนวณ total probability และ no reward probability
    const totalRewardProbability = gachaRewards.reduce(
      (sum, r) => sum + r.gachaProbability,
      0
    )
    const noRewardProbability = Math.max(0, 1 - totalRewardProbability)

    // ดึง user stats สำหรับ pity system info
    let userStats = await prisma.userRewardStats.findUnique({
      where: { characterId: character.id },
    })

    if (!userStats) {
      userStats = await prisma.userRewardStats.create({
        data: { characterId: character.id },
      })
    }

    return {
      gachaRewards: gachaRewards.map((reward) => ({
        ...reward,
        probabilityPercent: (reward.gachaProbability * 100).toFixed(2),
      })),
      noRewardProbability: {
        value: noRewardProbability,
        percentText: (noRewardProbability * 100).toFixed(2),
      },
      totalRewardProbability: {
        value: totalRewardProbability,
        percentText: (totalRewardProbability * 100).toFixed(2),
      },
      userStats: {
        luckyStreak: userStats.luckyStreak,
        totalPulls: userStats.totalGachaPulls,
        totalWins: userStats.totalGachaWins,
        winRate:
          userStats.totalGachaPulls > 0
            ? (
                (userStats.totalGachaWins / userStats.totalGachaPulls) *
                100
              ).toFixed(2)
            : '0.00',
      },
      costPerPull: 50,
    }
  }

  // ซื้อ reward โดยตรง
  async purchaseReward(rewardId: number) {
    const character = await this.getCurrentCharacter()

    try {
      // ใช้ transaction เพื่อความถูกต้อง
      const result = await prisma.$transaction(async (tx) => {
        // 1. ตรวจสอบ reward
        const reward = await tx.rewardItem.findUnique({
          where: { id: rewardId },
        })

        if (!reward || !reward.isActive) {
          throw new Error('Reward not found or inactive')
        }

        // 2. ตรวจสอบ stock
        if (reward.stock !== null && reward.stock <= 0) {
          throw new Error('Out of stock')
        }

        // 3. ตรวจสอบ token
        const userToken = await tx.userToken.findUnique({
          where: { userId: character.userId },
        })

        if (!userToken || userToken.currentTokens < reward.tokenCost) {
          throw new Error('Insufficient tokens')
        }

        // 4. หัก token
        const updatedUserToken = await tx.userToken.update({
          where: { userId: character.userId },
          data: {
            currentTokens: { decrement: reward.tokenCost },
            totalSpentTokens: { increment: reward.tokenCost },
          },
        })

        // 5. ลด stock (ถ้ามี)
        if (reward.stock !== null) {
          await tx.rewardItem.update({
            where: { id: rewardId },
            data: {
              stock: { decrement: 1 },
            },
          })
        }

        // 6. สร้าง purchase record
        const purchase = await tx.rewardPurchase.create({
          data: {
            characterId: character.id,
            rewardItemId: rewardId,
            purchaseType: 'direct',
            tokenSpent: reward.tokenCost,
            quantity: 1,
            status: 'pending',
          },
          include: {
            rewardItem: true,
          },
        })

        // 7. สร้าง token transaction
        await tx.tokenTransaction.create({
          data: {
            userId: character.userId,
            characterId: character.id,
            amount: -reward.tokenCost,
            type: 'shop_purchase',
            description: `Purchased ${reward.name}`,
            referenceId: purchase.id,
            referenceType: 'reward_purchase',
            balanceBefore: userToken.currentTokens,
            balanceAfter: updatedUserToken.currentTokens,
          },
        })

        return {
          purchase,
          currentTokens: updatedUserToken.currentTokens,
        }
      })

      return {
        success: true,
        message: 'Purchase successful',
        data: result,
      }
    } catch (error) {
      console.error('Purchase reward error:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to purchase reward'
      )
    }
  }

  // Gacha system
  async pullGacha(pullCount: 1 | 10 = 1) {
    const character = await this.getCurrentCharacter()

    const sessionId = uuidv4()
    const costPerPull = 50
    const totalCost = costPerPull * pullCount

    try {
      const results = await prisma.$transaction(async (tx) => {
        // 1. ตรวจสอบ token
        const userToken = await tx.userToken.findUnique({
          where: { userId: character.userId },
        })

        if (!userToken || userToken.currentTokens < totalCost) {
          throw new Error('Insufficient tokens')
        }

        // 2. ดึง rewards ที่สามารถได้จาก gacha
        const gachaRewards = await tx.rewardItem.findMany({
          where: {
            isActive: true,
            gachaProbability: { gt: 0 },
          },
        })

        // 3. ดึง character stats สำหรับ pity system
        let characterStats = await tx.userRewardStats.findUnique({
          where: { characterId: character.id },
        })

        if (!characterStats) {
          characterStats = await tx.userRewardStats.create({
            data: { characterId: character.id },
          })
        }

        // 4. ทำการสุ่ม
        const pullResults: GachaResult[] = []
        const purchases = []

        for (let i = 0; i < pullCount; i++) {
          const result = this.performGachaPull(
            gachaRewards,
            characterStats.luckyStreak + i
          )

          pullResults.push(result)

          // บันทึกประวัติ gacha
          const gachaHistory = await tx.gachaHistory.create({
            data: {
              characterId: character.id,
              rewardItemId: result.rewardId,
              sessionId,
              pullNumber: i + 1,
              tokenSpent: costPerPull,
              isWin: result.isWin,
            },
          })

          // ถ้าได้รางวัล สร้าง purchase record
          if (result.isWin && result.rewardId) {
            const purchase = await tx.rewardPurchase.create({
              data: {
                characterId: character.id,
                rewardItemId: result.rewardId,
                purchaseType: 'gacha',
                tokenSpent: costPerPull,
                quantity: 1,
                status: 'pending',
              },
              include: {
                rewardItem: true,
              },
            })
            purchases.push(purchase)

            // ตรวจสอบว่าเป็น itemType "xeny" หรือไม่
            const rewardItem = purchase.rewardItem
            if (rewardItem.itemType === 'xeny' && rewardItem.metadata) {
              const metadata = rewardItem.metadata as any
              const xenyAmount = metadata.value || 0

              if (xenyAmount > 0) {
                // สร้างหรืออัปเดต UserXeny
                // @ts-ignore
                let userXeny = await tx.userXeny.findUnique({
                  where: { userId: character.userId },
                })

                if (!userXeny) {
                  // @ts-ignore
                  userXeny = await tx.userXeny.create({
                    data: {
                      userId: character.userId,
                      currentXeny: xenyAmount,
                      totalEarnedXeny: xenyAmount,
                    },
                  })
                } else {
                  // @ts-ignore
                  userXeny = await tx.userXeny.update({
                    where: { userId: character.userId },
                    data: {
                      currentXeny: { increment: xenyAmount },
                      totalEarnedXeny: { increment: xenyAmount },
                    },
                  })
                }

                // สร้าง XenyTransaction
                // @ts-ignore
                await tx.xenyTransaction.create({
                  data: {
                    userId: character.userId,
                    characterId: character.id,
                    amount: xenyAmount,
                    type: 'gacha_reward',
                    description: `Received ${xenyAmount} Xeny from gacha`,
                    referenceId: purchase.id,
                    referenceType: 'gacha_reward',
                    balanceBefore: userXeny.currentXeny - xenyAmount,
                    balanceAfter: userXeny.currentXeny,
                  },
                })

                // อัปเดต status เป็น claimed สำหรับ xeny rewards
                await tx.rewardPurchase.update({
                  where: { id: purchase.id },
                  data: {
                    status: 'claimed',
                    claimedAt: new Date(),
                  },
                })
              }
            }

            // ลด stock ถ้ามี
            const reward = gachaRewards.find((r) => r.id === result.rewardId)
            if (reward && reward.stock !== null) {
              await tx.rewardItem.update({
                where: { id: result.rewardId },
                data: {
                  stock: { decrement: 1 },
                },
              })
            }
          }
        }

        // 5. อัปเดท user token
        const updatedUserToken = await tx.userToken.update({
          where: { userId: character.userId },
          data: {
            currentTokens: { decrement: totalCost },
            totalSpentTokens: { increment: totalCost },
          },
        })

        // 6. อัปเดท character stats
        const totalWins = pullResults.filter((r) => r.isWin).length
        const lastResult = pullResults[pullResults.length - 1]

        await tx.userRewardStats.update({
          where: { characterId: character.id },
          data: {
            totalGachaPulls: { increment: pullCount },
            totalGachaWins: { increment: totalWins },
            totalTokensSpent: { increment: totalCost },
            lastGachaAt: new Date(),
            luckyStreak: lastResult.isWin
              ? 0
              : characterStats.luckyStreak + pullCount,
          },
        })

        // 7. สร้าง token transaction
        await tx.tokenTransaction.create({
          data: {
            userId: character.userId,
            characterId: character.id,
            amount: -totalCost,
            type: 'shop_purchase',
            description: `Gacha ${pullCount}x pull`,
            referenceId: null,
            referenceType: 'gacha_pull',
            balanceBefore: userToken.currentTokens,
            balanceAfter: updatedUserToken.currentTokens,
          },
        })

        return {
          results: pullResults,
          purchases,
          currentTokens: updatedUserToken.currentTokens,
          sessionId,
        }
      })

      return {
        success: true,
        message: 'Gacha pull successful',
        data: results,
      }
    } catch (error) {
      console.error('Gacha pull error:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to pull gacha'
      )
    }
  }

  // Logic การสุ่ม gacha
  private performGachaPull(rewards: any[], luckyStreak: number): GachaResult {
    // 1. คำนวณ total probability จาก rewards ทั้งหมด
    const totalRewardProbability = rewards.reduce(
      (sum, r) => sum + r.gachaProbability,
      0
    )

    // 2. Validate ว่า total probability ไม่เกิน 1 (100%)
    if (totalRewardProbability > 1) {
      console.warn(
        `Warning: Total gacha probability exceeds 100% (${(totalRewardProbability * 100).toFixed(2)}%)`
      )
    }

    // 3. คำนวณ base no reward probability อัตโนมัติ
    // ถ้า rewards รวมกัน 30% -> no reward = 70%
    const baseNoRewardProbability = Math.max(0, 1 - totalRewardProbability)

    // 4. Pity system: ลดโอกาสไม่ได้รางวัลตาม lucky streak
    // เพิ่ม 1% ต่อครั้งที่ไม่ได้ สูงสุด 20%
    const pityBonus = Math.min(luckyStreak * 0.01, 0.2)
    const noRewardProbability = Math.max(0, baseNoRewardProbability - pityBonus)

    // 5. สุ่มเลข 0-1
    const random = Math.random()

    // 6. Log for debugging (ถ้าต้องการ)
    if (process.env.NODE_ENV === 'development') {
      console.log('Gacha Pull Debug:', {
        totalRewardProbability: (totalRewardProbability * 100).toFixed(2) + '%',
        baseNoReward: (baseNoRewardProbability * 100).toFixed(2) + '%',
        pityBonus: (pityBonus * 100).toFixed(2) + '%',
        finalNoReward: (noRewardProbability * 100).toFixed(2) + '%',
        luckyStreak,
        random: random.toFixed(4),
      })
    }

    // 7. ตรวจสอบว่าไม่ได้รางวัล
    if (random < noRewardProbability) {
      return {
        rewardId: null,
        reward: null,
        isWin: false,
      }
    }

    // 8. สุ่มว่าได้รางวัลไหน
    let cumulative = noRewardProbability
    for (const reward of rewards) {
      cumulative += reward.gachaProbability
      if (random < cumulative) {
        return {
          rewardId: reward.id,
          reward,
          isWin: true,
        }
      }
    }

    // 9. Fallback (ไม่ควรเกิด แต่ใส่ไว้เพื่อความปลอดภัย)
    console.error('Gacha pull fallback - this should not happen')
    return {
      rewardId: null,
      reward: null,
      isWin: false,
    }
  }

  // ดึงประวัติการซื้อ
  async getCharacterPurchaseHistory() {
    const character = await this.getCurrentCharacter()
    const purchases = await rewardPurchaseRepository.getCharacterPurchases(
      character.id
    )
    return purchases
  }

  // ดึงประวัติ gacha
  async getCharacterGachaHistory() {
    const character = await this.getCurrentCharacter()

    const [history, stats] = await Promise.all([
      gachaHistoryRepository.getCharacterGachaHistory(character.id),
      userRewardStatsRepository.getOrCreateCharacterStats(character.id),
    ])

    return {
      history,
      stats,
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
      },
    }
  }
}

export const rewardService = RewardService.getInstance()
