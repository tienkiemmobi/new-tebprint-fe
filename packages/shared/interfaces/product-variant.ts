import { z } from 'zod';

import { Status } from '../enums';

export const ProductVariantZodSchema = z.object({
  _id: z.string(),
  size: z.string({ required_error: 'Size is required' }).trim().min(1, { message: 'Size is required' }).max(20),
  color: z.string({ required_error: 'Color is required' }).trim().min(1, { message: 'Color is required' }).max(20),
  code: z.string().optional(),
  sku: z.string().trim().max(32).optional(),
  price: z.coerce
    .number({ required_error: 'Price is required', invalid_type_error: 'Price is not a valid number' })
    .min(1, { message: 'Price must be at least 1' }),
  usPrice: z.coerce
    .number({ required_error: 'US Price is required', invalid_type_error: 'Us Price is not a valid number' })
    .optional()
    .transform((val) => (!val ? undefined : val)),
  vnShipPrice: z.coerce
    .number()
    .optional()
    .transform((val) => (!val ? undefined : val)),
  usShipPrice: z.coerce
    .number({ required_error: 'US Ship Price is required', invalid_type_error: 'US Ship Price is not a valid number' })
    .optional()
    .transform((val) => (!val ? undefined : val)),
  description: z.string().trim().max(40),
  quantity: z.coerce
    .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity is not a valid number' })
    .int({ message: 'Quantity must be integer' })
    .min(0, { message: 'Quantity must be at least 0' })
    .max(99999)
    .optional()
    .nullable(),
  baseCost: z.coerce
    .number({ required_error: 'Base cost is required', invalid_type_error: 'Base Cost is not a valid number' })
    .min(1, { message: 'Base cost must be at least 1' }),
  style: z.string().trim().max(20),
  status: z.nativeEnum(Status).default(Status.Active),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantZodSchema>;
