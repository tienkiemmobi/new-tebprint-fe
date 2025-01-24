import { z } from 'zod';

export const TwoFactorAuthZodSchema = z.object({
  otp: z.string().trim().min(1, { message: 'Authentication code is required' }),
  password: z.string().trim().min(6, { message: 'Password code is required' }),
});

export type TwoFactorAuthDto = z.infer<typeof TwoFactorAuthZodSchema>;
