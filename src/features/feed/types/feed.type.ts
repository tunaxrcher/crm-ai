import type {
  Achievement,
  Character,
  CharacterAchievement,
  Comment,
  FeedItem,
  JobLevel,
  LevelHistory,
  Like,
  Quest,
  QuestSubmission,
  ReplyComment,
  User,
} from '@prisma/client'

export interface FeedItemWithRelations extends FeedItem {
  user: User
  likes: (Like & { user: User })[]
  comments: (Comment & {
    user: User
    replies: (ReplyComment & { user: User })[]
  })[]
  questSubmission?: QuestSubmission & { quest: Quest }
  levelHistory?: LevelHistory & {
    character: Character & {
      currentJobLevel: JobLevel
    }
  }
  achievement?: CharacterAchievement & { achievement: Achievement }
  hasLiked?: boolean
  likesCount?: number
  commentsCount?: number
}

export type FeedItemType =
  | 'quest_complete'
  | 'level_up'
  | 'achievement'
  | 'post'
  | 'new_portrait'
