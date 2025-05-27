import { BaseService } from '@src/lib/service/client/baseService'

export class CharacterService extends BaseService {
  private static instance: CharacterService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService()
    }
    return CharacterService.instance
  }

  async fetchCharacter(id?: string) {
    const response = await fetch(`/api/character${id ? `/${id}` : ''}`)

    if (!response.ok) {
      throw new Error('Failed to fetch character data')
    }

    return response.json()
  }

  async addXP(amount: number) {
    const response = await fetch('/api/character/add-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      throw new Error('Failed to add XP')
    }

    return response.json()
  }

  async levelUp() {
    const response = await fetch('/api/character/level-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to level up')
    }

    return response.json()
  }

  async submitDailyQuest() {
    const response = await fetch('/api/character/submit-daily-quest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to submit daily quest')
    }

    return response.json()
  }
}

export const characterService = CharacterService.getInstance()
