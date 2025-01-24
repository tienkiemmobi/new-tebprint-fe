import type { Category, Response } from 'shared';
import { CategoryZodSchema } from 'shared';
import { z } from 'zod';

export const NewCategoryZodSchema = CategoryZodSchema.pick({ name: true, description: true, code: true }).extend({
  parentId: z.string().optional(),
});

export type NewCategoryDto = z.infer<typeof NewCategoryZodSchema>;

export const UpdateCategoryZodSchema = CategoryZodSchema.pick({ name: true, description: true, code: true }).extend({
  parentId: z.string().optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategoryZodSchema>;

export type CategoriesResponse = Response & {
  data?: Category[] | null;
};

export type CategoryResponse = Response & {
  data?: Category | null;
};
