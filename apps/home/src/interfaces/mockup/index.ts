import type { Response } from 'shared';
import { CustomImageZodSchema } from 'shared';
import { z } from 'zod';

export const MockupZodSchema = z.object({
  _id: z.string(),
  fileName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  file: CustomImageZodSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Mockup = z.infer<typeof MockupZodSchema>;

export type MockupResponse = {
  data: Mockup | null;
} & Response;

export type MockupsResponse = {
  data: Mockup[] | null;
} & Response;

export type MockupDownloadResponse = {
  expiresAt: string;
  encryptedUrl: string;
  signature: string;
  cdn: string;
} & Response;
