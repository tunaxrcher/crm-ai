import { userRepository } from '../repository'

export type AchievementWithProgress = Awaited<
  ReturnType<typeof userRepository.getAllAchievementsWithUserProgress>
>[number]


export interface AchievementListProps {
  achievements: AchievementWithProgress[]
  showOnlyEarned?: boolean
}