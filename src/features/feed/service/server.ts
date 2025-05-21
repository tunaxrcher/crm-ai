// src/features/feed/service/server.ts
import "server-only";
import { BaseService } from "@src/lib/service/server/baseService";
import { feedRepository, storyRepository, likeRepository, commentRepository } from "../repository";

// Feed Service
export class FeedService extends BaseService {
  private static instance: FeedService;

  constructor() {
    super();
  }

  public static getInstance() {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  async getFeedItems(params: {
    page: number;
    limit: number;
    userId?: number;
  }) {
    const { page, limit, userId } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      feedRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          likes: {
            include: { user: true },
          },
          comments: {
            include: {
              user: true,
              replies: {
                include: { user: true },
              },
            },
          },
          questSubmission: {
            include: { quest: true },
          },
          levelHistory: true,
          achievement: {
            include: { achievement: true },
          },
        },
      }),
      feedRepository.count(),
    ]);

    // เช็คว่า userId ที่ส่งมาได้กดไลค์หรือยัง
    const itemsWithLikeStatus = items.map((item) => ({
      ...item,
      hasLiked: userId
        ? item.likes.some((like) => like.userId === userId)
        : false,
      likesCount: item.likes.length,
      commentsCount: item.comments.length,
    }));

    return {
      items: itemsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFeedItemById(id: number) {
    return feedRepository.findById(id, {
      include: {
        user: true,
        likes: {
          include: { user: true },
        },
        comments: {
          include: {
            user: true,
            replies: {
              include: { user: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async createFeedItem(data: {
    userId: number;
    content: string;
    type: string;
    mediaType?: "text" | "image" | "video";
    mediaUrl?: string;
  }) {
    return feedRepository.create(data);
  }

  async deleteFeedItem(id: number) {
    return feedRepository.delete(id);
  }
}

// Story Service
export class StoryService extends BaseService {
  private static instance: StoryService;

  constructor() {
    super();
  }

  public static getInstance() {
    if (!StoryService.instance) {
      StoryService.instance = new StoryService();
    }
    return StoryService.instance;
  }

  async getActiveStories(userId?: number) {
    const stories = await storyRepository.findActiveStories({
      include: {
        user: true,
        views: userId ? {
          where: { userId },
        } : false,
      },
    });

    return stories.map((story) => ({
      ...story,
      hasViewed: userId ? story.views.length > 0 : false,
      viewsCount: story.views.length,
    }));
  }

  async createStory(data: {
    userId: number;
    content?: string;
    type: "text" | "image" | "video";
    mediaUrl?: string;
    text?: string;
    expiresInHours?: number;
  }) {
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + (data.expiresInHours || 24)
    );

    return storyRepository.create({
      ...data,
      expiresAt,
    });
  }

  async markStoryAsViewed(data: { storyId: number; userId: number }) {
    // เช็คว่าเคยดูแล้วหรือยัง
    const existingView = await storyRepository.findStoryView(
      data.storyId,
      data.userId
    );

    if (existingView) {
      return existingView;
    }

    return storyRepository.createStoryView(data);
  }
}

// Like Service
export class LikeService extends BaseService {
  private static instance: LikeService;

  constructor() {
    super();
  }

  public static getInstance() {
    if (!LikeService.instance) {
      LikeService.instance = new LikeService();
    }
    return LikeService.instance;
  }

  async toggleLike(data: { feedItemId: number; userId: number }) {
    const existingLike = await likeRepository.findByUserAndFeedItem(
      data.userId,
      data.feedItemId
    );

    if (existingLike) {
      await likeRepository.delete(existingLike.id);
      return { liked: false };
    }

    await likeRepository.create(data);
    return { liked: true };
  }

  async getLikesByFeedItem(feedItemId: number) {
    return likeRepository.findByFeedItem(feedItemId, {
      include: { user: true },
    });
  }
}

// Comment Service
export class CommentService extends BaseService {
  private static instance: CommentService;

  constructor() {
    super();
  }

  public static getInstance() {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  async getCommentsByFeedItem(feedItemId: number) {
    return commentRepository.findByFeedItem(feedItemId, {
      include: {
        user: true,
        replies: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createComment(data: {
    feedItemId: number;
    userId: number;
    content: string;
  }) {
    return commentRepository.create(data);
  }

  async createReplyComment(data: {
    commentId: number;
    userId: number;
    content: string;
  }) {
    return commentRepository.createReply(data);
  }

  async deleteComment(id: number) {
    return commentRepository.delete(id);
  }
}

// Export instances
export const feedService = FeedService.getInstance();
export const storyService = StoryService.getInstance();
export const likeService = LikeService.getInstance();
export const commentService = CommentService.getInstance();