import { ProductZodSchema } from 'shared';
import { z } from 'zod';

import { NewProductVariantZodSchema } from '@/interfaces/product-variant';

export const NewProductZodSchema = ProductZodSchema.omit({
  _id: true,
  productionTime: true,
  shippingTime: true,
  mainImage: true,
  otherImages: true,
  category: true,
  variants: true,
  propertyOrder: true,
}).extend({
  categoryId: z.string().min(1, { message: 'Field is required!' }),
  productionTimeStart: z.coerce.number().gt(0, { message: 'Time start must bigger than 0' }),
  productionTimeEnd: z.coerce.number().gt(0, { message: 'Time end bigger than 0' }),
  shippingTimeStart: z.coerce.number().gt(0, { message: 'Time start bigger than 0' }),
  shippingTimeEnd: z.coerce.number().gt(0, { message: 'Time end bigger than 0' }),
  // variants: z.array(z.custom<NewProductVariantDto>()),
});

export type NewProductDto = z.infer<typeof NewProductZodSchema>;

export const UpdateProductZodSchema = NewProductZodSchema;

export type UpdateProductDto = z.infer<typeof UpdateProductZodSchema>;

export const NewProductPayloadZodSchema = NewProductZodSchema.omit({
  productionTimeStart: true,
  productionTimeEnd: true,
  shippingTimeEnd: true,
  shippingTimeStart: true,
}).extend({
  productionTime: z.string(),
  shippingTime: z.string(),
  mainImageId: z.string(),
  otherImageIds: z.array(z.string()),
  variants: z.array(NewProductVariantZodSchema),
  propertyOrder: z.array(z.string()),
});

export type NewProductPayLoadDto = z.infer<typeof NewProductPayloadZodSchema>;
