import type { ProductVariant, Response } from 'shared/interfaces';
import { ProductVariantZodSchema } from 'shared/interfaces';
import { z } from 'zod';

export const NewProductVariantZodSchema = ProductVariantZodSchema.partial({
  _id: true,
  description: true,
  style: true,
});

export const NewProductVariantsZodSchema = z.array(NewProductVariantZodSchema);

export type NewProductVariantDto = z.infer<typeof NewProductVariantZodSchema>;

export type GetProductVariantsByCodes = {
  id: string;
  data?: {
    _id: string;
    color: string;
    code: string;
    style: string;
    size: string;
  };
};

export type GetProductVariantsByCodesResponse = {
  data?: GetProductVariantsByCodes[] | null;
} & Response;

export type ProductVariantResponse = {
  data: ProductVariant | null;
} & Response;
