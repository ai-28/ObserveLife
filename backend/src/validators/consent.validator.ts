import { z } from 'zod';

export const createConsentSchema = z.object({
  resident_id: z.string().uuid(),
  consent_type: z.enum(['SELF', 'REPRESENTATIVE']),
  rep_name: z.string().optional(),
  rep_relationship: z.string().optional(),
  form_version: z.string().default('1.0'),
  ip_address: z.string().optional(),
});

export type CreateConsentInput = z.infer<typeof createConsentSchema>;
