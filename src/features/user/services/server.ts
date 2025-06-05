// src/features/user/services/server.ts
import { getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import { UserRepository, userRepository } from '../repository'
import { Character, JobLevel } from '../types'

export class UserService extends BaseService {
  private static instance: UserService
  private userRepository: UserRepository

  constructor() {
    super()
    this.userRepository = userRepository
  }

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }

    return UserService.instance
  }

  async getUser(id: number) {
    return this.userRepository.findById(id)
  }

  async getUsersByUserId(userId: number) {
    return this.userRepository.findByUserId(userId)
  }

  async getUserCharacters() {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[Server] Fetching User Character with ID: ${userId}`)

    const userWithCharacter = await this.getUserWithCharacterData(userId)
    const character = userWithCharacter.character!

    const [questStats, achievements, currentJobLevel] = await Promise.all([
      this.getCharacterQuestStats(character.id),
      this.getCharacterAchievements(userId),
      this.getCurrentJobLevel(character),
    ])

    return {
      character: this.buildCharacterData(
        character,
        questStats,
        achievements,
        currentJobLevel
      ),
      jobClass: this.buildJobClassData(character.jobClass),
    }
  }

  // ============= Private Helper Methods =============

  private async getUserWithCharacterData(userId: number) {
    const userWithCharacter =
      await this.userRepository.findUserWithCharacterById(userId)

    if (!userWithCharacter || !userWithCharacter.character) {
      throw new Error('Character not found')
    }

    return userWithCharacter
  }

  private async getCharacterQuestStats(characterId: number) {
    return this.userRepository.getCharacterQuestStats(characterId)
  }

  private async getCharacterAchievements(userId: number) {
    return this.userRepository.getAllAchievementsWithUserProgress(userId)
  }

  private getCurrentJobLevel(character: any): JobLevel {
    // if (!character.jobClass || !character.jobClass.levels || character.jobClass.levels.length === 0) {
    //   // Return default job level if no levels exist
    //   return {
    //     level: 1,
    //     title: 'Beginner',
    //     requiredCharacterLevel: 1,
    //     imageUrl: null
    //   }
    // }

    // Find the highest level that the character qualifies for
    for (let i = character.jobClass.levels.length - 1; i >= 0; i--) {
      const jobLevel = character.jobClass.levels[i]
      if (character.level >= jobLevel.requiredCharacterLevel) {
        return jobLevel
      }
    }

    // Return the first level if character doesn't qualify for any
    return character.jobClass.levels[0]
  }

  private buildCharacterData(
    character: any,
    questStats: any,
    achievements: any,
    currentJobLevel: JobLevel
  ) {
    return {
      id: character.id,
      name: character.name,
      jobClassName: character.jobClass.name,
      currentJobLevel: currentJobLevel.level, // Return only the level number, not the whole object
      level: character.level,
      currentXP: character.currentXP,
      nextLevelXP: character.nextLevelXP,
      totalXP: character.totalXP,
      title: currentJobLevel.title,
      stats: {
        AGI: character.statAGI,
        STR: character.statSTR,
        DEX: character.statDEX,
        VIT: character.statVIT,
        INT: character.statINT,
      },
      statPoints: character.statPoints,
      achievements,
      questStats,
      portrait: character.currentPortraitUrl,
    }
  }

  private buildJobClassData(jobClass: any) {
    return {
      id: jobClass.id,
      name: jobClass.name,
      description: jobClass.description,
      levels: jobClass.levels.map((level: any) => ({
        level: level.level,
        requiredCharacterLevel: level.requiredCharacterLevel,
        title: level.title,
        imageUrl: level.imageUrl,
      })),
    }
  }
}

export const userService = UserService.getInstance()
