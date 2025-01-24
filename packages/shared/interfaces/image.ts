import type { ImageControlStatus, ImageControlType } from '@shared/enums';
import { z } from 'zod';

import { Status, UploadFileType } from '../enums';
import type { Response } from './baseTemplate';

export const ImageZodSchema = z.object({
  _id: z.string(),
  key: z.string(),
  fileId: z.string().nullable(),
  mimeType: z.string(),
  bucket: z.string(),
  region: z.string(),
  fileSize: z.number(),
  folder: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dpi: z.number().optional(),
  link: z.string(),
  sha1: z.string(),
  status: z.nativeEnum(Status).default(Status.Inactive).optional(),
  preview: z.string(),
  previewFileId: z.string().optional(),
  previewWidth: z.number(),
  previewQuality: z.number(),
  thumbnail: z.string(),
  thumbnailFileId: z.string().optional(),
  previewFolder: z.string(),
  thumbnailFolder: z.string(),
  thumbnailWidth: z.number(),
  thumbnailQuality: z.number(),
  type: z.nativeEnum(UploadFileType),
  // owner: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Image = z.infer<typeof ImageZodSchema>;

export const NewImageZodSchema = z.object({
  type: z.nativeEnum(UploadFileType).optional(),
  shouldUploadThumbnail: z.boolean().optional(),
});

export type NewImageDto = z.infer<typeof NewImageZodSchema>;

export const CustomImageZodSchema = ImageZodSchema.pick({
  _id: true,
  preview: true,
});

export type CustomImageDto = z.infer<typeof CustomImageZodSchema>;

export type ImageResponse = {
  data: CustomImageDto;
} & Response;

// ==========others =================

export type ImageControlItem = {
  id: string;
  imageUrl: string;
  imagePreviewUrl: string;
  isChecked: boolean;
  status: ImageControlStatus;
  file?: File;
  type?: ImageControlType;
};
