import { z } from 'zod';

export const ShipmentEventZodSchema = z.object({
  date: z.string(),
  detail: z.string(),
  name: z.string(),
});

export type ShipmentEvent = z.infer<typeof ShipmentEventZodSchema>;
