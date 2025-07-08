// src/features/feed/services/server.ts
import { getServerSession } from '@src/lib/auth'
import { BaseService } from '@src/lib/services/server/baseService'
import 'server-only'

import {
  commentRepository,
  feedRepository,
  likeRepository,
  storyRepository,
} from '../repository'
import { notificationService } from '@src/features/notifications/services/server'

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

    console.log(`[SERVER] Feeds: ${userId}`)

    const { page, limit } = params
    const skip = (page - 1) * limit

    const [items, total] = (await Promise.all([
      feedRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: {
          type: {
            in: ['quest_completion', 'level_up', 'achievement', 'new_portrait'],
          },
        },
        include: {
          user: {
            include: {
              character: {
                include: {
                  currentJobLevel: true,
                },
              },
            },
          },
          likes: {
            include: {
              user: {
                include: {
                  character: {
                    include: {
                      currentJobLevel: true,
                    },
                  },
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                include: {
                  character: {
                    include: {
                      currentJobLevel: true,
                    },
                  },
                },
              },
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

  async getActiveStories() {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[SERVER] Fetching stories for user: ${userId}`)

    // 1. ดึง stories พร้อม user และ character
    const stories = await storyRepository.findActiveStories()
    if (stories.length === 0) return []

    // 2. ดึง statistics แบบ parallel
    const storyIds = stories.map((s) => s.id)

    const [viewStats, userViews] = await Promise.all([
      storyRepository.getViewStats(storyIds),
      storyRepository.getUserViewedStories(storyIds, userId),
    ])

    // 3. สร้าง lookup maps
    const viewCountMap = new Map(
      viewStats.map((stat) => [stat.storyId, stat._count._all])
    )
    const userViewSet = new Set(userViews.map((v) => v.storyId))

    // 4. Merge ข้อมูลทั้งหมด
    return stories.map((story) => ({
      id: story.id,
      content: story.content,
      type: story.type,
      mediaUrl: story.mediaUrl,
      thumbnailUrl: story.thumbnailUrl,
      text: story.text,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
      userId: story.userId,
      user: {
        id: story.user.id,
        name: story.user.name,
        email: story.user.email,
        character: story.user.character,
      },
      hasViewed: userViewSet.has(story.id),
      viewsCount: viewCountMap.get(story.id) || 0,
    }))
  }

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

    console.log(`[SERVER] Like Feed: ${feedItemId}`)

    const existingLike = await likeRepository.findByUserAndFeedItem(
      userId,
      feedItemId
    )

    if (existingLike) {
      console.log('❌ Unlike detected - removing like, no notification sent')
      await likeRepository.delete(existingLike.id)
      return { liked: false }
    }

    console.log('💖 New like detected - will send notification')

    // สร้าง like
    await likeRepository.create({
      userId,
      feedItemId,
    })

    // ส่งแจ้งเตือนให้เจ้าของฟีด (ถ้าไม่ใช่ตัวเอง)
    try {
      console.log('🔍 Checking if notification should be sent for like...')
      
      const feedItem = await feedRepository.findById(feedItemId, {
        include: { user: { include: { character: true } } }
      })
      
      console.log('📝 Feed item found:', {
        feedId: feedItemId,
        feedOwnerId: feedItem?.userId,
        likerId: userId,
        shouldSendNotification: feedItem && feedItem.userId !== userId
      })
      
      if (feedItem && feedItem.userId !== userId) {
        // ใช้ข้อมูลจาก session
        const likerName = session.user.name || 'Unknown User'
        console.log('📤 Sending like notification:', {
          feedOwnerId: feedItem.userId,
          likerName
        })
        
        await notificationService.createLikeNotification({
          feedOwnerId: feedItem.userId,
          likerName,
        })
        
        console.log('✅ Like notification sent successfully')
      } else {
        console.log('ℹ️ No notification sent (own post or feed not found)')
      }
    } catch (error) {
      console.error('❌ Error creating like notification:', error)
      // ไม่ให้ error ใน notification กระทบต่อการทำงานหลัก
    }

    return { liked: true }
  }

  async getLikesByFeedItem(feedItemId: number) {
    return likeRepository.findByFeedItem(feedItemId, {
      include: {
        user: {
          include: {
            character: {
              include: {
                currentJobLevel: true,
              },
            },
          },
        },
      },
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
          include: {
            user: {
              include: {
                character: {
                  include: {
                    currentJobLevel: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createComment(feedItemId: number, content: string) {
    const session = await getServerSession()
    const userId = +session.user.id

    console.log(`[SERVER] createComment: ${feedItemId}`)

    const comment = await commentRepository.create({
      feedItemId,
      userId,
      content,
    })

    // ส่งแจ้งเตือนให้เจ้าของฟีด (ถ้าไม่ใช่ตัวเอง)
    try {
      console.log('🔍 Checking if notification should be sent for comment...')
      
      const feedItem = await feedRepository.findById(feedItemId, {
        include: { user: { include: { character: true } } }
      })
      
      console.log('📝 Feed item found:', {
        feedId: feedItemId,
        feedOwnerId: feedItem?.userId,
        commenterId: userId,
        shouldSendNotification: feedItem && feedItem.userId !== userId
      })
      
      if (feedItem && feedItem.userId !== userId) {
        const commenterName = session.user.name || 'Unknown User'
        console.log('📤 Sending comment notification:', {
          feedOwnerId: feedItem.userId,
          commenterName,
          comment: content
        })
        
        await notificationService.createCommentNotification({
          feedOwnerId: feedItem.userId,
          commenterName,
          comment: content,
        })
        
        console.log('✅ Comment notification sent successfully')
      } else {
        console.log('ℹ️ No notification sent (own post or feed not found)')
      }
    } catch (error) {
      console.error('❌ Error creating comment notification:', error)
      // ไม่ให้ error ใน notification กระทบต่อการทำงานหลัก
    }

    return comment
  }

  async createReplyComment(data: {
    commentId: number
    userId: number
    content: string
  }) {
    const reply = await commentRepository.createReply(data)

    // ส่งแจ้งเตือนให้เจ้าของความคิดเห็นต้นฉบับ (ถ้าไม่ใช่ตัวเอง)
    try {
      const originalComment = await commentRepository.findById(data.commentId)
      
      if (originalComment && originalComment.userId !== data.userId) {
        // ใช้ข้อมูลจาก session แทน
        const session = await getServerSession()
        const replierName = session.user.name || 'Unknown User'
        
        await notificationService.createReplyNotification({
          originalCommenterId: originalComment.userId,
          replierName,
          reply: data.content,
        })
      }
    } catch (error) {
      console.error('Error creating reply notification:', error)
      // ไม่ให้ error ใน notification กระทบต่อการทำงานหลัก
    }

    return reply
  }

  async deleteComment(id: number) {
    return commentRepository.delete(id)
  }
}
export const commentService = CommentService.getInstance()
