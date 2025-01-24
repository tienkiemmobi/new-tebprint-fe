import { type Response, Status } from 'shared';
import { z } from 'zod';

export const StoreZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: z.string(),
  code: z.string(),
  owner: z.string(),
  description: z.string().optional(),
  products: z.number().optional(),
  orders: z.number().optional(),
  status: z.nativeEnum(Status).optional().default(Status.Active),
  updatedAt: z.string(), // Consider using z.date() if it's in date format
  createdAt: z.string(), // Consider using z.date() if it's in date format
});

export type Store = z.infer<typeof StoreZodSchema>;

export const CustomStoreZodSchema = StoreZodSchema.pick({
  _id: true,
  type: true,
  name: true,
  description: true,
  status: true,
}).extend({
  ordersCount: z.array(z.number()),
});

export type CustomStoreDto = z.infer<typeof CustomStoreZodSchema>;

export const CreateStoreZodSchema = StoreZodSchema.pick({
  name: true,
  description: true,
  status: true,
});

export type CreateStoreDto = z.infer<typeof CreateStoreZodSchema>;

export const UpdateStoreZodSchema = StoreZodSchema.pick({
  name: true,
  description: true,
  status: true,
}).partial({
  name: true,
  description: true,
  status: true,
});

export type UpdateStoreDto = z.infer<typeof UpdateStoreZodSchema>;

export type StoreResponse = {
  data: Store | null;
} & Response;

export type StoresResponse = {
  data: Store[] | null;
} & Response;
