import { Comment, FeedItem, Like, Prisma, Story } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

// Feed Repository
export class FeedRepository extends BaseRepository<FeedItem> {
  private static instance: FeedRepository

  public static getInstance() {
    if (!FeedRepository.instance) {
      FeedRepository.instance = new FeedRepository()
    }
    return FeedRepository.instance
  }

  async findAll() {
    return this.prisma.feedItem.findMany()
  }

  async findMany(args?: Prisma.FeedItemFindManyArgs) {
    return this.prisma.feedItem.findMany(args)
  }

  async count(args?: Prisma.FeedItemCountArgs) {
    return this.prisma.feedItem.count(args)
  }

  async findById(
    id: number,
    args?: Omit<Prisma.FeedItemFindUniqueArgs, 'where'>
  ) {
    return this.prisma.feedItem.findUnique({
      where: { id },
      ...args,
    })
  }

  async create(data: Prisma.FeedItemCreateInput) {
    return this.prisma.feedItem.create({ data })
  }

  async update(id: number, data: Prisma.FeedItemUpdateInput) {
    return this.prisma.feedItem.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.feedItem.delete({
      where: { id },
    })
  }
}

// Story Repository
export class StoryRepository extends BaseRepository<Story> {
  private static instance: StoryRepository

  public static getInstance() {
    if (!StoryRepository.instance) {
      StoryRepository.instance = new StoryRepository()
    }
    return StoryRepository.instance
  }

  async findAll() {
    return this.prisma.story.findMany()
  }

  async findById(id: number) {
    return this.prisma.story.findUnique({
      where: { id },
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.story.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.story.delete({
      where: { id },
    })
  }

  /**
   * ดึง active stories พร้อมข้อมูลที่เกี่ยวข้อง
   */
  async findActiveStories() {
    return this.prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            character: true, // Include character ที่เชื่อมกับ user
          },
        },
      },
    })
  }

  /**
   * ดึงสถิติ views ของแต่ละ story
   */
  async getViewStats(storyIds: number[]) {
    return this.prisma.storyView.groupBy({
      by: ['storyId'],
      where: {
        storyId: { in: storyIds },
      },
      _count: {
        _all: true,
      },
    })
  }

  /**
   * ดึง stories ที่ user เคยดู
   */
  async getUserViewedStories(storyIds: number[], userId: number) {
    return this.prisma.storyView.findMany({
      where: {
        storyId: { in: storyIds },
        userId: userId,
      },
      select: {
        storyId: true,
      },
    })
  }

  async create(data: Prisma.StoryCreateInput) {
    return this.prisma.story.create({ data })
  }

  async findStoryView(storyId: number, userId: number) {
    return this.prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId,
          userId,
        },
      },
    })
  }

  async createStoryView(data: { storyId: number; userId: number }) {
    return this.prisma.storyView.create({ data })
  }
}

// Like Repository
export class LikeRepository extends BaseRepository<Like> {
  private static instance: LikeRepository

  public static getInstance() {
    if (!LikeRepository.instance) {
      LikeRepository.instance = new LikeRepository()
    }
    return LikeRepository.instance
  }

  async findAll() {
    return this.prisma.like.findMany()
  }

  async findById(id: number) {
    return this.prisma.like.findUnique({
      where: { id },
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Like, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.like.update({
      where: { id },
      data,
    })
  }

  async findByUserAndFeedItem(userId: number, feedItemId: number) {
    return this.prisma.like.findUnique({
      where: {
        feedItemId_userId: {
          feedItemId,
          userId,
        },
      },
    })
  }

  async findByFeedItem(feedItemId: number, args?: Prisma.LikeFindManyArgs) {
    return this.prisma.like.findMany({
      where: { feedItemId },
      ...args,
    })
  }

  async create(data: { feedItemId: number; userId: number }) {
    return this.prisma.like.create({ data })
  }

  async delete(id: number) {
    return this.prisma.like.delete({
      where: { id },
    })
  }
}

// Comment Repository
export class CommentRepository extends BaseRepository<Comment> {
  private static instance: CommentRepository

  public static getInstance() {
    if (!CommentRepository.instance) {
      CommentRepository.instance = new CommentRepository()
    }
    return CommentRepository.instance
  }

  async findAll() {
    return this.prisma.comment.findMany()
  }

  async findById(id: number) {
    return this.prisma.comment.findUnique({
      where: { id },
    })
  }

  async findByFeedItem(feedItemId: number, args?: Prisma.CommentFindManyArgs) {
    return this.prisma.comment.findMany({
      where: { feedItemId },
      ...args,
    })
  }

  async create(
    data: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput,
    options?: { include?: Prisma.CommentInclude }
  ) {
    return this.prisma.comment.create({
      data,
      include: options?.include || { user: true }, // Default include user
    })
  }

  async createReply(
    data: {
      commentId: number
      userId: number
      content: string
    },
    options?: { include?: Prisma.ReplyCommentInclude }
  ) {
    return this.prisma.replyComment.create({
      data,
      include: options?.include || { user: true }, // Default include user
    })
  }

  async update(id: number, data: Prisma.CommentUpdateInput) {
    return this.prisma.comment.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.comment.delete({
      where: { id },
    })
  }
}

// Export instances
export const feedRepository = FeedRepository.getInstance()
export const storyRepository = StoryRepository.getInstance()
export const likeRepository = LikeRepository.getInstance()
export const commentRepository = CommentRepository.getInstance()
