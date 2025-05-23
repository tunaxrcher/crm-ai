import { userRepository } from '../repository'

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  earned: boolean
  earnedOn?: string | null
}

export type AchievementWithProgress = Awaited<
  ReturnType<typeof userRepository.getAllAchievementsWithUserProgress>
>[number]


export interface AchievementListProps {
  achievements: AchievementWithProgress[]
  showOnlyEarned?: boolean
}