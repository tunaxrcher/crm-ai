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

  async createCharacter(payload: CharacterCreatePayload) {
    const formData = new FormData()

    formData.append('jobClassId', payload.jobClassId)
    formData.append('name', payload.name)
    formData.append('portraitType', payload.portraitType)

    if (payload.file) formData.append('file', payload.file)

    const res = await fetch('/api/character/generate', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error(await res.text())

    return res.json()
  }

  async confirmCharacter(payload: CharacterConfirmPayload) {
    const res = await fetch('/api/character/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(await res.text())

    return res.json()
  }
}
export const characterService = CharacterService.getInstance()

export class JobClassService extends BaseService {
  private static instance: JobClassService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobClassService.instance) {
      JobClassService.instance = new JobClassService()
    }
    return JobClassService.instance
  }

  // Fetch jobClasss
  async fetchJobClass() {
    const response = await fetch(`/api/jobClasss`)

    if (!response.ok) {
      throw new Error(`Error fetching jobClasss: ${response.statusText}`)
    }

    const data = await response.json()

    return data
  }
}
export const jobClassService = JobClassService.getInstance()

export class JobLevelService extends BaseService {
  private static instance: JobLevelService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobLevelService.instance) {
      JobLevelService.instance = new JobLevelService()
    }
    return JobLevelService.instance
  }
}
export const jobLevelService = JobLevelService.getInstance()
