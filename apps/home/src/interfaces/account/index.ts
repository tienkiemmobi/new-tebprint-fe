import { type Response, TwoFactorAuthZodSchema, UserZodSchema } from 'shared';
import { z } from 'zod';

import { RoleType } from '@/constants';

const AccountZodSchema = UserZodSchema.omit({
  password: true,
  otherPermissions: true,
  permissions: true,
}).extend({
  birthday: z.string().optional(),
  factory: z.string().optional(),
  role: z.nativeEnum(RoleType),
});

export type Account = z.infer<typeof AccountZodSchema>;

export const MeZodSchema = AccountZodSchema.pick({
  fullName: true,
  email: true,
  userCode: true,
  gender: true,
  phone: true,
  address: true,
  role: true,
  twoFactorEnabled: true,
});

export type MeDto = z.infer<typeof MeZodSchema>;

export const Verify2FaOtpPayloadZodSchema = TwoFactorAuthZodSchema.extend({
  recaptchaToken: z.string(),
});

export type Verify2FaOtpPayloadDto = z.infer<typeof Verify2FaOtpPayloadZodSchema>;

export type AccountResponse = {
  data: Account | null;
} & Response;

export type TwoFaSecretResponse = {
  data: string | null;
} & Response;

export type Verify2FaOtpResponse = {
  data: string | null;
} & Response;
