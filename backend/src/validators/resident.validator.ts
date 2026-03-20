import { z } from 'zod';

export const createResidentSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  room_number: z.string().optional(),
  care_type: z.enum(['SNF', 'AL', 'HOSPICE']),
});

export const createResidentWithUserSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  room_number: z.string().optional(),
  care_type: z.enum(['SNF', 'AL', 'HOSPICE']),
});

export const updateResidentSchema = z.object({
  name: z.string().min(1).optional(),
  room_number: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type CreateResidentInput = z.infer<typeof createResidentSchema>;
export type CreateResidentWithUserInput = z.infer<typeof createResidentWithUserSchema>;
export type UpdateResidentInput = z.infer<typeof updateResidentSchema>;
