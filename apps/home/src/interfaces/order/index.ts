import {
  OrderLogZodSchema,
  OrdersImportExpenseBaseZodSchema,
  OrdersImportItemBaseZodSchema,
  OrderTrackingZodSchema,
  type Response,
  ShippingAddressZodSchema,
  ShippingEventZodSchema,
} from 'shared';
import { z } from 'zod';

import { LineItemZodSchema } from '../order-item';

export const OrderZodSchema = z.object({
  _id: z.string(),
  orderId: z.string().optional(),
  externalId: z.string(),
  name: z.string(),
  shippingAddress: ShippingAddressZodSchema,
  shippingMethod: z.string(),
  type: z.string(),
  store: z.string(),
  user: z.string(),
  status: z.string(),
  priority: z.number(),
  shippingEvents: z.array(ShippingEventZodSchema),
  shippingStatus: z.string(),
  tracking: OrderTrackingZodSchema,
  logs: z.array(OrderLogZodSchema),
  lineItems: z.array(LineItemZodSchema),
  isPaid: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sellerNote: z.string().optional(),
  systemNote: z.string().optional(),
  importError: z.string().optional(),
  isImporting: z.boolean().optional(),
  privateNote: z.string().optional(),
  giftMessage: z.string().optional(),
  designerName: z.string().optional(),
});

export type Order = z.infer<typeof OrderZodSchema>;

export const OrderExportCsvZodSchema = OrderZodSchema.partial({
  lineItems: true,
  createdAt: true,
  shippingAddress: true,
  logs: true,
  shippingEvents: true,
  tracking: true,
  updatedAt: true,
});

export type OrderExportCsvDto = z.infer<typeof OrderExportCsvZodSchema>;

export const OrdersImportItemZodSchema = OrdersImportItemBaseZodSchema.extend({
  note: z.string().optional(),
  storeCode: z.string(),
  designerName: z.string().optional(),
});

export type OrdersImportItemDto = z.infer<typeof OrdersImportItemZodSchema>;

export const OrdersImportExpenseZodSchema = OrdersImportExpenseBaseZodSchema.extend({
  note: z.string().optional(),
});

export type OrdersImportExpenseDto = z.infer<typeof OrdersImportExpenseZodSchema>;

export const ArtworkImageZodSchema = z.object({
  frontArtwork: z.string(),
  backArtwork: z.string(),
});

export type ArtworkImageDto = z.infer<typeof ArtworkImageZodSchema>;

export const MockupImageZodSchema = z.object({
  mockup1: z.string().optional(),
  mockup2: z.string().optional(),
});

export type MockupImageDto = z.infer<typeof MockupImageZodSchema>;

export const OrderSubmitZodSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number(),
  frontArtwork: z.string().optional(),
  backArtwork: z.string().optional(),
  mockup1: z.string().optional(),
  mockup2: z.string().optional(),
});

export type OrderSubmitDto = z.infer<typeof OrderSubmitZodSchema>;

export const OrdersImportExpenseTableZodSchema = OrdersImportItemZodSchema.extend({
  expenses: z.array(OrdersImportExpenseZodSchema),
});

export type OrdersImportExpenseTableDto = z.infer<typeof OrdersImportExpenseTableZodSchema>;

export const CancelReasonZodSchema = z.object({
  orderCancellationReasons: z.string(),
  description: z.string(),
});

export type CancelReasonDto = z.infer<typeof CancelReasonZodSchema>;

export const ReturnReasonZodSchema = z.object({
  orderReturnReasons: z.string(),
  description: z.string(),
});

export type ReturnReasonDto = z.infer<typeof ReturnReasonZodSchema>;

export const OrderIssueZodSchema = z.object({
  issue: z.string(),
  description: z.string(),
});

export type OrderIssueDto = z.infer<typeof OrderIssueZodSchema>;

export const PackageOrderZodSchema = z.object({
  packageId: z.string().optional().default(''),
  weight: z.coerce.number().min(1).max(10000),
  width: z.coerce.number().min(1).max(60),
  height: z.coerce.number().min(1).max(60),
  length: z.coerce.number().min(1).max(60),
  skipAddressCheck: z.boolean().optional().default(false),
  scan: z.boolean().optional().default(false),
  service: z.enum(['OnosExpress', 'AnanBay', 'NSLog']),
});

export type PackageOrderDto = z.infer<typeof PackageOrderZodSchema>;

export type OrdersResponse = {
  data: Order[] | null;
} & Response;

export type OrderResponse = {
  data: Order | null;
} & Response;
