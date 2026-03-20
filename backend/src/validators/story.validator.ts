import { z } from 'zod';

export const createStorySchema = z.object({
  resident_id: z.string().uuid(),
  title: z.string().optional(),
  video_url: z.string().url('Invalid video URL'),
  prompt_id: z.string().uuid().optional(),
  question_id: z.string().uuid().optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FAMILY_ONLY']).default('FAMILY_ONLY'),
  duration_seconds: z.number().int().positive().optional(),
});

export const updateStorySchema = z.object({
  title: z.string().optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FAMILY_ONLY']).optional(),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
