import { z } from 'zod';

export const CreateFactoryActionSchema = z.object({
  name: z.string().trim().min(1, { message: 'name is required' }).max(40),
  description: z.string().trim().max(40),
});

export type CreateFactoryActionDto = z.infer<typeof CreateFactoryActionSchema>;
