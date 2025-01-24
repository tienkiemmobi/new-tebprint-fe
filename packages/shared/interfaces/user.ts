import { z } from 'zod';

import { Status } from '../enums';
import type { Response } from './baseTemplate';
import { RoleZodSchema } from './role';

export const UserZodSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  userCode: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string(),
  gender: z.string(),
  address: z.string(),
  otherPermissions: z.array(z.string()),
  status: z.nativeEnum(Status),
  permissions: z.array(z.string()),
  role: RoleZodSchema,
  twoFactorEnabled: z.boolean().optional(),
  balance: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  telegramConfig: z
    .object({
      telegramChannelId: z.string().optional(),
      telegramBotToken: z.string().optional(),
      isNotificationEnabled: z.boolean().optional(),
    })
    .optional(),
  refCode: z.string().length(8).optional(),
});

export type User = z.infer<typeof UserZodSchema>;

export const NewUserZodSchema = UserZodSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  gender: true,
  address: true,
  password: true,
  status: true,
  refCode: true,
})
  .partial({
    password: true,
    status: true,
  })
  .extend({
    roleId: z.string(),
  });

export type NewUserDto = z.infer<typeof NewUserZodSchema>;

export const UpdateUserZodSchema = UserZodSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  gender: true,
  address: true,
  password: true,
  status: true,
})
  .partial({
    password: true,
    status: true,
  })
  .extend({
    roleId: z.string(),
    telegramChannelId: z.string().optional(),
    isNotificationEnabled: z.boolean().optional(),
  });

export type UpdateUserDto = z.infer<typeof UpdateUserZodSchema>;
export type UserResponse = {
  data: User | null;
} & Response;

export type UsersResponse = {
  data: User[] | null;
} & Response;
