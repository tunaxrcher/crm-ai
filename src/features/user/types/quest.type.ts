import { userRepository } from "../repository";

export type QuestStats = Awaited<
  ReturnType<typeof userRepository.getCharacterQuestStats>
>


export interface QuestStatsProps {
  stats: QuestStats
}