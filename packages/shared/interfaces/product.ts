import { z } from 'zod';

import { Status } from '../enums';
import type { Response } from './baseTemplate';
import { CategoryZodSchema } from './category';
import { CustomImageZodSchema } from './image';
import { ProductVariantZodSchema } from './product-variant';

export const ProductZodSchema = z.object({
  _id: z.string(),
  title: z.string().trim().min(1, { message: 'Field is required!' }),
  description: z.string().min(1, { message: 'Field is required!' }),
  productCode: z.string().min(1, { message: 'Field is required!' }),
  category: CategoryZodSchema,
  price: z.coerce.number().gt(0, { message: 'Price must bigger than 0' }),
  mainImage: CustomImageZodSchema,
  otherImages: z.array(CustomImageZodSchema),
  productionTime: z.string(),
  shippingTime: z.string(),
  notes: z.string().min(1, { message: 'Field is required!' }),
  personalization: z.string().min(1).max(255).optional(),
  variants: z.array(ProductVariantZodSchema),
  propertyOrder: z.array(z.string()),
  status: z.nativeEnum(Status).default(Status.Active),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Product = z.infer<typeof ProductZodSchema>;

export type ProductResponse = {
  data: Product | null;
} & Response;

export type ProductsResponse = {
  data: Product[] | null;
} & Response;
