import type { Response } from 'shared';
import { CustomImageZodSchema, ExternalFileLinkZodSchema, ProductZodSchema } from 'shared';
import { z } from 'zod';

export const LineItemZodSchema = z.object({
  _id: z.string(),
  order: z.string(),
  product: ProductZodSchema,
  variant: z.string(),
  barcode: z.string(),
  quantity: z.number(),
  status: z.string(),
  frontArtwork: CustomImageZodSchema,
  backArtwork: CustomImageZodSchema.optional(),
  mockup1: CustomImageZodSchema.optional(),
  mockup2: CustomImageZodSchema.optional(),
  note: z.string(),
  total: z.number().optional(),
  subtotal: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sellerNote: z.string().optional(),
  systemNote: z.string().optional(),
  externalFileLinks: z.array(ExternalFileLinkZodSchema),
  productTitle: z.string(),
  productCode: z.string(),
  variantCode: z.string().optional(),
  variantSize: z.string().optional(),
  variantColor: z.string().optional(),
  variantStyle: z.string().optional(),
});

export type LineItem = z.infer<typeof LineItemZodSchema>;

export type OrderItemResponse = {
  data: LineItem | null;
} & Response;

export type ExternalFileLinkResponse = {
  data:
    | {
        fileName: string;
        message: string;
        success: boolean;
        url: string;
      }[]
    | null;
} & Response;
