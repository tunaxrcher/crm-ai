// src/features/feed/services/server.ts
import { Prisma } from '@prisma/client'
import { getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import {
  commentRepository,
  feedRepository,
  likeRepository,
  storyRepository,
} from '../repository'

// Feed Service
export class FeedService extends BaseService {
  private static instance: FeedService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService()
    }
    return FeedService.instance
  }

  async getFeedItems(params: { page: number; limit: number }) {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[Server] Feeds: ${userId}`)

    const { page, limit } = params
    const skip = (page - 1) * limit

    const includeRelations = {
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
    } as const

    const [items, total] = (await Promise.all([
      feedRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: {
          type: {
            in: ['quest_completion', 'level_up', 'achievement'],
          },
        },
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
    ])) as any

    // เช็คว่า userId ที่ส่งมาได้กดไลค์หรือยัง
    const itemsWithLikeStatus = items.map(
      (item: { likes: any[]; comments: string | any[] }) => ({
        ...item,
        hasLiked: userId
          ? item.likes.some((like) => like.userId === userId)
          : false,
        likesCount: item.likes.length,
        commentsCount: item.comments.length,
      })
    )

    return {
      items: itemsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // async getFeedItems(params: { page: number; limit: number; userId?: number }) {
  //   const { page, limit, userId } = params;

  //   // Step 1: ดึงจำนวนทั้งหมดของ feed ที่ตรงเงื่อนไข
  //   const total = await feedRepository.count({
  //     where: {
  //       type: {
  //         in: ["quest_completion", "level_up", "achievement"],
  //       },
  //     },
  //   });

  //   // Step 2: สุ่ม offset (โดยใช้ Math.random)
  //   const maxOffset = Math.max(0, total - limit);
  //   const skip = Math.floor(Math.random() * (maxOffset + 1));

  //   // Step 3: ดึง feed แบบ random
  //   const items = await feedRepository.findMany({
  //     skip,
  //     take: limit,
  //     where: {
  //       type: {
  //         in: ["quest_completion", "level_up", "achievement"],
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc", // หรือจะไม่ใส่ก็ได้หากไม่อยาก bias การเรียง
  //     },
  //     include: {
  //       user: true,
  //       likes: {
  //         include: { user: true },
  //       },
  //       comments: {
  //         include: {
  //           user: true,
  //           replies: {
  //             include: { user: true },
  //           },
  //         },
  //       },
  //       questSubmission: {
  //         include: { quest: true },
  //       },
  //       levelHistory: true,
  //       achievement: {
  //         include: { achievement: true },
  //       },
  //     },
  //   });

  //   // Step 4: enrich ข้อมูล hasLiked, likesCount, commentsCount
  //   const itemsWithLikeStatus = items.map((item) => ({
  //     ...item,
  //     hasLiked: userId
  //       ? item.likes.some((like) => like.userId === userId)
  //       : false,
  //     likesCount: item.likes.length,
  //     commentsCount: item.comments.length,
  //   }));

  //   // Step 5: return พร้อม pagination
  //   return {
  //     items: itemsWithLikeStatus,
  //     pagination: {
  //       page,
  //       limit,
  //       total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

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
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  // src/features/feed/services/server.ts
  async createFeedItem(data: {
    userId: number
    content: string
    type: string
    mediaType?: 'text' | 'image' | 'video'
    mediaUrl?: string
  }) {
    return feedRepository.create({
      content: data.content,
      type: data.type,
      mediaType: data.mediaType || 'text',
      mediaUrl: data.mediaUrl,
      user: {
        connect: { id: data.userId }, // ใช้ connect แทน userId
      },
    })
  }

  async deleteFeedItem(id: number) {
    return feedRepository.delete(id)
  }
}
export const feedService = FeedService.getInstance()

// Story Service
export class StoryService extends BaseService {
  private static instance: StoryService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!StoryService.instance) {
      StoryService.instance = new StoryService()
    }
    return StoryService.instance
  }

  async getActiveStories(userId?: number) {
    const stories = await storyRepository.findActiveStories({
      include: {
        user: true,
        views: true, // Include all views always to count
      },
    })

    // Type assertion to let TypeScript know about the included relations
    type StoryWithRelations = Prisma.StoryGetPayload<{
      include: {
        user: true
        views: true
      }
    }>

    const storiesWithRelations = stories as StoryWithRelations[]

    return storiesWithRelations.map((story) => ({
      ...story,
      hasViewed:
        userId && story.views
          ? story.views.some((view) => view.userId === userId)
          : false,
      viewsCount: story.views?.length || 0,
    }))
  }

  // async createStory(data: {
  //   userId: number
  //   content?: string
  //   type: 'text' | 'image' | 'video'
  //   mediaUrl?: string
  //   text?: string
  //   expiresInHours?: number
  // }) {
  //   const expiresAt = new Date()
  //   expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24))

  //   const { userId, expiresInHours, ...storyData } = data

  //   return storyRepository.create({
  //     ...storyData,
  //     expiresAt,
  //     user: {
  //       connect: { id: userId },
  //     },
  //   })
  // }
  async createStory(data: {
    userId: number
    content?: string
    type: 'text' | 'image' | 'video'
    mediaUrl?: string
    thumbnailUrl?: string // เพิ่มพารามิเตอร์นี้
    text?: string
    expiresInHours?: number
  }) {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24))

    const { userId, expiresInHours, ...storyData } = data

    return storyRepository.create({
      ...storyData,
      expiresAt,
      user: {
        connect: { id: userId },
      },
    })
  }

  async markStoryAsViewed(data: { storyId: number; userId: number }) {
    // เช็คว่าเคยดูแล้วหรือยัง
    const existingView = await storyRepository.findStoryView(
      data.storyId,
      data.userId
    )

    if (existingView) {
      return existingView
    }

    return storyRepository.createStoryView(data)
  }
}
export const storyService = StoryService.getInstance()

// Like Service
export class LikeService extends BaseService {
  private static instance: LikeService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!LikeService.instance) {
      LikeService.instance = new LikeService()
    }
    return LikeService.instance
  }

  async toggleLike(feedItemId: number) {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[Server] Like Feed: ${feedItemId}`)

    const existingLike = await likeRepository.findByUserAndFeedItem(
      userId,
      feedItemId
    )

    if (existingLike) {
      await likeRepository.delete(existingLike.id)
      return { liked: false }
    }

    await likeRepository.create({
      userId,
      feedItemId,
    })

    return { liked: true }
  }

  async getLikesByFeedItem(feedItemId: number) {
    return likeRepository.findByFeedItem(feedItemId, {
      include: { user: true },
    })
  }
}
export const likeService = LikeService.getInstance()

// Comment Service
export class CommentService extends BaseService {
  private static instance: CommentService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService()
    }
    return CommentService.instance
  }

  async getCommentsByFeedItem(feedItemId: number) {
    return commentRepository.findByFeedItem(feedItemId, {
      include: {
        user: true,
        replies: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createComment(feedItemId: number, content: string) {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[Server] createComment: ${feedItemId}`)

    return commentRepository.create({
      feedItemId,
      userId,
      content,
    })
  }

  async createReplyComment(data: {
    commentId: number
    userId: number
    content: string
  }) {
    return commentRepository.createReply(data)
  }

  async deleteComment(id: number) {
    return commentRepository.delete(id)
  }
}
export const commentService = CommentService.getInstance()
