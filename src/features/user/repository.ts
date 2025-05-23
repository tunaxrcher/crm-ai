import { User } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

export class UserRepository extends BaseRepository<User> {
  private static instance: UserRepository

  public static getInstance() {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository()
    }
    return UserRepository.instance
  }

  async findAll() {
    return this.prisma.user.findMany()
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: number) {
    return this.prisma.user.findMany({
      where: { id: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.user.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    })
  }

  async findUserWithCharacterById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        character: {
          include: {
            jobClass: {
              include: {
                levels: {
                  orderBy: { level: 'asc' },
                },
              },
            },
            currentJobLevel: true,
            achievements: {
              include: {
                achievement: true,
              },
              orderBy: { earnedOn: 'desc' },
            },
          },
        },
      },
    })
  }

  async getCharacterQuestStats(characterId: number) {
    // ดึงสถิติการทำเควสของ character
    const questSubmissions = await this.prisma.questSubmission.findMany({
      where: { characterId },
      include: {
        quest: true,
      },
    })

    const totalCompleted = questSubmissions.length
    const dailyCompleted = questSubmissions.filter(
      (sub) => sub.quest.type === 'daily'
    ).length
    const weeklyCompleted = questSubmissions.filter(
      (sub) => sub.quest.type === 'weekly'
    ).length

    // คำนวณคะแนนเฉลี่ย
    const ratings = questSubmissions.map((sub) => {
      const total =
        (sub.ratingAGI || 0) +
        (sub.ratingSTR || 0) +
        (sub.ratingDEX || 0) +
        (sub.ratingVIT || 0) +
        (sub.ratingINT || 0)
      return total / 5
    })

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0

    return {
      totalCompleted,
      dailyCompleted,
      weeklyCompleted,
      averageRating: Math.round(averageRating * 10) / 10, // ปัดเศษทศนิยม 1 ตำแหน่ง
    }
  }

  async getAllAchievementsWithUserProgress(userId: number) {
    // ดึง achievement ทั้งหมดและตรวจสอบว่า user ได้รับหรือยัง
    const allAchievements = await this.prisma.achievement.findMany({
      orderBy: { id: 'asc' },
    })

    const userAchievements = await this.prisma.characterAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    })

    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua])
    )

    return allAchievements.map((achievement) => {
      const userAchievement = userAchievementMap.get(achievement.id)
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        earned: !!userAchievement,
        earnedOn: userAchievement?.earnedOn || null,
      }
    })
  }
}

export const userRepository = UserRepository.getInstance()
