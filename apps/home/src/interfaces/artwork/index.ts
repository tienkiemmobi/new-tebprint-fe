import { CustomImageZodSchema, type Response } from 'shared';
import { z } from 'zod';

export const ArtworkZodSchema = z.object({
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

export type Artwork = z.infer<typeof ArtworkZodSchema>;

export type ArtworkResponse = {
  data: Artwork | null;
} & Response;

export type ArtworksResponse = {
  data: Artwork[] | null;
} & Response;

export type ArtworkDownloadResponse = {
  expiresAt: string;
  encryptedUrl: string;
  signature: string;
  cdn: string;
} & Response;
