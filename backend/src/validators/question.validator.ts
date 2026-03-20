import { z } from 'zod';

export const createQuestionSchema = z.object({
    resident_id: z.string().uuid(),
    question_text: z.string().min(1).max(500, 'Question must be 500 characters or less'),
    notify_all_family: z.boolean().default(true),
});

export const updateQuestionSchema = z.object({
    status: z.enum(['PENDING', 'ANSWERED']).optional(),
    answered_story_id: z.string().uuid().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
