import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['platform_admin', 'facility_admin', 'family', 'resident', 'staff']),
    organization_id: z.string().uuid().optional(),
    // Organization fields (required for facility_admin)
    organizationName: z.string().optional(),
    organizationType: z.enum(['SNF', 'AL', 'HOSPICE']).optional(),
    organizationAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is facility_admin, organization fields are required
      if (data.role === 'facility_admin') {
        return !!(data.organizationName && data.organizationType);
      }
      // For other roles, organization_id should be provided if needed
      return true;
    },
    {
      message: 'Organization name and type are required for facility admin registration',
      path: ['organizationName'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  notification_method: z.enum(['EMAIL', 'SMS', 'NONE']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;