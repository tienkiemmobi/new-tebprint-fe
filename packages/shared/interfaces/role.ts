import { z } from 'zod';

import type { Response } from '..';
import { Status } from '../enums';

export const RoleZodSchema = z.object({
  _id: z.string(),
  name: z.string().trim().min(1, { message: 'Name is required' }),
  description: z.string(),
  permissions: z.array(z.string()),
  status: z.nativeEnum(Status),
});

export type Role = z.infer<typeof RoleZodSchema>;

export const NewRoleZodSchema = RoleZodSchema.omit({ _id: true }).extend({
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.nativeEnum(Status).optional(),
});

export type NewRoleDto = z.infer<typeof NewRoleZodSchema>;

export const UpdateRoleZodSchema = RoleZodSchema.pick({
  // name: true,
  description: true,
  status: true,
}).extend({
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleZodSchema>;

export const CustomRoleZodSchema = RoleZodSchema.partial({
  description: true,
  permissions: true,
  status: true,
});

export type CustomRoleDto = z.infer<typeof CustomRoleZodSchema>;

export type RolesResponse = Response & {
  data?: Role[] | null;
};

export type RoleResponse = Response & {
  data?: Role | null;
};
