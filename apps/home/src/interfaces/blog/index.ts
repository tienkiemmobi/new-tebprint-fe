import type { Response } from 'shared';
import { z } from 'zod';

const BlogZodSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.any(),
  createdAt: z.date(),
  slug: z.string(),
  tags: z.array(z.string()),
});

export type Blog = z.infer<typeof BlogZodSchema>;

export type BlogResponse = {
  data: Blog | null;
} & Response;

export type BlogsResponse = {
  data: Blog[] | null;
} & Response;
