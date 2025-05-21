// src/features/feed/repository.ts
import { BaseRepository } from "@src/lib/repository/baseRepository";
import {
  FeedItem,
  Story,
  StoryView,
  Like,
  Comment,
  ReplyComment,
  Prisma,
} from "@prisma/client";

// Feed Repository
export class FeedRepository extends BaseRepository<FeedItem> {
  private static instance: FeedRepository;

  public static getInstance() {
    if (!FeedRepository.instance) {
      FeedRepository.instance = new FeedRepository();
    }
    return FeedRepository.instance;
  }

  async findMany(args?: Prisma.FeedItemFindManyArgs) {
    return this.prisma.feedItem.findMany(args);
  }

  async count(args?: Prisma.FeedItemCountArgs) {
    return this.prisma.feedItem.count(args);
  }

  async findById(id: number, args?: Prisma.FeedItemFindUniqueArgs) {
    return this.prisma.feedItem.findUnique({
      where: { id },
      ...args,
    });
  }

  async create(data: Prisma.FeedItemCreateInput) {
    return this.prisma.feedItem.create({ data });
  }

  async update(id: number, data: Prisma.FeedItemUpdateInput) {
    return this.prisma.feedItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.feedItem.delete({
      where: { id },
    });
  }
}

// Story Repository
export class StoryRepository extends BaseRepository<Story> {
  private static instance: StoryRepository;

  public static getInstance() {
    if (!StoryRepository.instance) {
      StoryRepository.instance = new StoryRepository();
    }
    return StoryRepository.instance;
  }

  async findActiveStories(args?: Prisma.StoryFindManyArgs) {
    return this.prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
      ...args,
    });
  }

  async create(data: Prisma.StoryCreateInput) {
    return this.prisma.story.create({ data });
  }

  async findStoryView(storyId: number, userId: number) {
    return this.prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId,
          userId,
        },
      },
    });
  }

  async createStoryView(data: { storyId: number; userId: number }) {
    return this.prisma.storyView.create({ data });
  }
}

// Like Repository
export class LikeRepository extends BaseRepository<Like> {
  private static instance: LikeRepository;

  public static getInstance() {
    if (!LikeRepository.instance) {
      LikeRepository.instance = new LikeRepository();
    }
    return LikeRepository.instance;
  }

  async findByUserAndFeedItem(userId: number, feedItemId: number) {
    return this.prisma.like.findUnique({
      where: {
        feedItemId_userId: {
          feedItemId,
          userId,
        },
      },
    });
  }

  async findByFeedItem(feedItemId: number, args?: Prisma.LikeFindManyArgs) {
    return this.prisma.like.findMany({
      where: { feedItemId },
      ...args,
    });
  }

  async create(data: { feedItemId: number; userId: number }) {
    return this.prisma.like.create({ data });
  }

  async delete(id: number) {
    return this.prisma.like.delete({
      where: { id },
    });
  }
}

// Comment Repository
export class CommentRepository extends BaseRepository<Comment> {
  private static instance: CommentRepository;

  public static getInstance() {
    if (!CommentRepository.instance) {
      CommentRepository.instance = new CommentRepository();
    }
    return CommentRepository.instance;
  }

  async findByFeedItem(feedItemId: number, args?: Prisma.CommentFindManyArgs) {
    return this.prisma.comment.findMany({
      where: { feedItemId },
      ...args,
    });
  }

  async create(data: Prisma.CommentCreateInput) {
    return this.prisma.comment.create({ data });
  }

  async createReply(data: {
    commentId: number;
    userId: number;
    content: string;
  }) {
    return this.prisma.replyComment.create({ data });
  }

  async update(id: number, data: Prisma.CommentUpdateInput) {
    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}

// Export instances
export const feedRepository = FeedRepository.getInstance();
export const storyRepository = StoryRepository.getInstance();
export const likeRepository = LikeRepository.getInstance();
export const commentRepository = CommentRepository.getInstance();
