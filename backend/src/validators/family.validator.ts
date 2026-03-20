import { z } from 'zod';

export const createFamilyConnectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  relationship: z.string().min(1, 'Relationship is required'),
});

export const batchInviteSchema = z.object({
  resident_id: z.string().uuid(),
  contacts: z.array(createFamilyConnectionSchema).min(1),
});

export type CreateFamilyConnectionInput = z.infer<typeof createFamilyConnectionSchema>;
export type BatchInviteInput = z.infer<typeof batchInviteSchema>;
