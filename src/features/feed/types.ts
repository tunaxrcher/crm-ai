// Define all types related to Feed feature

export interface User {
  id: string;
  name: string;
  avatar: string;
  title?: string;
  level?: number;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: Date;
}

export interface Engagement {
  likes: number;
  comments: Comment[];
}

export interface QuestCompletion {
  title: string;
  xpEarned: number;
  statsGained: {
    AGI?: number;
    STR?: number;
    DEX?: number;
    VIT?: number;
    INT?: number;
  };
}

export interface LevelUp {
  previousLevel: number;
  newLevel: number;
  newTitle: string;
  statsAllocated: {
    AGI?: number;
    STR?: number;
    DEX?: number;
    VIT?: number;
    INT?: number;
  };
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
}

export interface QuestCompletionContent {
  quest: QuestCompletion;
  image: string;
  timestamp: Date;
  engagement: Engagement;
}

export interface LevelUpContent {
  previousLevel: number;
  newLevel: number;
  newTitle: string;
  statsAllocated: {
    AGI?: number;
    STR?: number;
    DEX?: number;
    VIT?: number;
    INT?: number;
  };
  timestamp: Date;
  engagement: Engagement;
}

export interface AchievementContent {
  achievement: Achievement;
  timestamp: Date;
  engagement: Engagement;
}

export type FeedItemContent = QuestCompletionContent | LevelUpContent | AchievementContent;

export interface FeedItem {
  id: string;
  type: 'quest_complete' | 'level_up' | 'achievement';
  user: User;
  content: FeedItemContent;
}

export interface StoryMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Story {
  id: string;
  user: User;
  media: StoryMedia;
  questTitle: string;
  viewed: boolean;
}

export interface FeedResponse {
  feedItems: FeedItem[];
  stories: Story[];
}

export interface AddCommentRequest {
  feedItemId: string;
  text: string;
}

export interface LikeRequest {
  feedItemId: string;
}

export interface AddCommentResponse {
  success: boolean;
  comment: Comment;
}

export interface LikeResponse {
  success: boolean;
  likes: number;
}
