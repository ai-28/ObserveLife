import { z } from 'zod';

export const createStaffSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['staff', 'facility_admin'], {
      errorMap: () => ({ message: 'Role must be either "staff" or "facility_admin"' }),
    }),
    staffType: z.enum(['facilitator', 'therapist']).optional(),
    department: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is 'staff', staffType must be provided
      if (data.role === 'staff' && !data.staffType) {
        return false;
      }
      // If role is 'facility_admin', staffType should not be provided
      if (data.role === 'facility_admin' && data.staffType) {
        return false;
      }
      return true;
    },
    {
      message: 'Staff type is required for staff role and should not be provided for facility_admin role',
      path: ['staffType'],
    }
  );

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
