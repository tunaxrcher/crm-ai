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
}

export const characterService = CharacterService.getInstance()
