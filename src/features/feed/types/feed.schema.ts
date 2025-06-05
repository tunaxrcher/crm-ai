import { z } from 'zod'

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(1000),
  mediaType: z.enum(['text', 'image', 'video']).optional(),
  mediaUrl: z.string().url().optional(),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(500),
})

export const GetFeedSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  type: z.string().optional(),
})

// Type inference
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type GetFeedInput = z.infer<typeof GetFeedSchema>
