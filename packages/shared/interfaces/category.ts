import { z } from 'zod';

export const CategoryParentZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
});

export type CategoryParentDto = z.infer<typeof CategoryParentZodSchema>;

export const CategoryZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parent: CategoryParentZodSchema.nullable(),
  code: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Category = z.infer<typeof CategoryZodSchema>;
