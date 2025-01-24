import { z } from 'zod';

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(6).trim(),
    newPassword: z
      .string()
      .min(8, { message: 'Password must contain at least 8 characters' })
      .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must contain at least 1 uppercase character and 1 numeric character',
      })
      .trim(),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must contain at least 8 characters' })
      .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must contain at least 1 uppercase character and 1 numeric character',
      })
      .trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password doesn't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
