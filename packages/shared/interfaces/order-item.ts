import { z } from 'zod';

export const ExternalFileLinkZodSchema = z.object({
  url: z.string().url(),
  fileName: z.string().optional(),
});

export type ExternalFileLinkDto = z.infer<typeof ExternalFileLinkZodSchema>;
