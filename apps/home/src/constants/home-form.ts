import { z } from 'zod';

export const ContactInfoZod = z.object({
  fullName: z
    .string({ required_error: 'First name is required' })
    .describe('Full name')
    .trim()
    .min(3, { message: 'At least 3 characters' })
    .max(40),
  email: z.string({ required_error: 'Email is required' }).email(),
  phone: z
    .string()
    .describe('Phone number')
    .regex(/^\d+$/, { message: 'Invalid phone number' })
    .min(8, { message: 'At least 8 characters' })
    .max(12, { message: 'Invalid phone number' })
    .optional(),
  webUrl: z.string().describe('Website URL').trim().url({ message: 'Invalid URL' }).optional(),
});
