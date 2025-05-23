import { userRepository } from "../repository";

// export interface QuestStats {
//   totalCompleted: number
//   dailyCompleted: number
//   weeklyCompleted: number
//   averageRating: number
// }

export type QuestStats = Awaited<
  ReturnType<typeof userRepository.getCharacterQuestStats>
>


export interface QuestStatsProps {
  stats: QuestStats
}