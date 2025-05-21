// src/features/feed/types.ts (เพิ่มเติม)
import {
  FeedItem,
  User,
  Like,
  Comment,
  ReplyComment,
  Story,
  StoryView,
  QuestSubmission,
  Quest,
  LevelHistory,
  CharacterAchievement,
  Achievement,
  JobLevel,
  Character,
} from "@prisma/client";

// Extended types with relations
export interface FeedItemWithRelations extends FeedItem {
  user: User;
  likes: (Like & { user: User })[];
  comments: (Comment & {
    user: User;
    replies: (ReplyComment & { user: User })[];
  })[];
  questSubmission?: QuestSubmission & { quest: Quest };
  levelHistory?: LevelHistory & {
    character: Character & {
      currentJobLevel: JobLevel;
    };
  };
  achievement?: CharacterAchievement & { achievement: Achievement };
  hasLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
}

export interface StoryWithRelations extends Story {
  user: User;
  views: StoryView[];
  hasViewed?: boolean;
  viewsCount?: number;
}

export interface FeedResponse {
  items: FeedItemWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types สำหรับ UI components ที่มีอยู่แล้ว
export interface FeedItemUI {
  id: string;
  type: "quest_complete" | "level_up" | "achievement" | "post";
  user: {
    id: number;
    name: string;
    avatar: string;
    level?: number;
    title?: string;
  };
  content: {
    timestamp: string | Date;
    engagement: {
      likes: number;
      comments: CommentUI[];
    };
    // Type-specific content
    quest?: {
      id: number;
      title: string;
      xpEarned: number;
    };
    image?: string;
    previousLevel?: number;
    newLevel?: number;
    newTitle?: string;
    achievement?: {
      id: number;
      name: string;
      description: string;
      icon: string;
    };
    text?: string;
  };
}

export interface CommentUI {
  id: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string | Date;
}

export interface StoryUI {
  id: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    level?: number;
  };
  media: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  };
  questTitle?: string;
  viewed: boolean;
  expiresAt: string | Date;
}

// Request/Response types
export interface CreatePostRequest {
  content: string;
  mediaType?: "text" | "image" | "video";
  mediaUrl?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface ToggleLikeResponse {
  liked: boolean;
}
