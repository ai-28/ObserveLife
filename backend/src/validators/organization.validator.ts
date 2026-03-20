import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['SNF', 'AL', 'HOSPICE']),
    address: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    billing_status: z.enum(['PILOT', 'ACTIVE', 'SUSPENDED']).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
