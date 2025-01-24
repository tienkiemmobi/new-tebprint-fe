import { z } from 'zod';

export const ShippingAddressZodSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(0).optional().default(''),
  // email: z.string().email().min(0).optional(),
  // phone: z.string().min(0).optional(),
  addressLine1: z.string().min(2),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  zip: z.string().min(5),
  region: z.string().min(2),
  country: z.string().length(2),
});

export type ShippingAddressDto = z.infer<typeof ShippingAddressZodSchema>;

export const OrderTrackingZodSchema = z.object({
  trackingNumber: z.string().optional(),
  carrierName: z.string().optional(),
  carrierCode: z.string().optional(),
  trackingUrl: z.string().optional(),
  platformOrderUrl: z.string().optional(),
  shippingLabelUrl: z.string().optional(),
});

export type OrderTrackingDto = z.infer<typeof OrderTrackingZodSchema>;

export const OrderLogZodSchema = z.object({
  date: z.string(),
  status: z.string(),
  updatedBy: z.string(),
});

export type OrderLogDto = z.infer<typeof OrderLogZodSchema>;

export const ShippingEventZodSchema = z.object({
  date: z.date(),
  status: z.string().optional(),
});

export type ShippingEventDto = z.infer<typeof ShippingEventZodSchema>;

export const OrdersImportItemBaseZodSchema = z.object({
  externalId: z.string(),
  shippingMethod: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string(),
  region: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  zip: z.string(),
  quantity: z.string(),
  variantId: z.string(),
  frontArtworkUrl: z.string(),
  backArtworkUrl: z.string().optional(),
  mockupUrl1: z.string().optional(),
  mockupUrl2: z.string().optional(),
  note: z.string().optional(),
  giftMessage: z.string().optional(),
  storeCode: z.string(),
  designerName: z.string().optional(),
  externalLink: z.string().optional(),
  labelUrl: z.string().optional(),
});

export type OrdersImportItemBaseDto = z.infer<typeof OrdersImportItemBaseZodSchema>;

export const OrdersImportExpenseBaseZodSchema = z.object({
  quantity: z.string(),
  variantId: z.string(),
  frontArtworkUrl: z.string(),
  backArtworkUrl: z.string(),
  mockupUrl1: z.string(),
  mockupUrl2: z.string(),
  note: z.string().optional(),
});

export type OrdersImportExpenseBaseDto = z.infer<typeof OrdersImportExpenseBaseZodSchema>;

export const OrderNoteZodSchema = z.object({
  note: z.string().min(2),
});

export type OrderNoteDto = z.infer<typeof OrderNoteZodSchema>;

export type NoteType = 'seller-note' | 'system-note' | 'private-note';
