import { z } from 'zod';

export const TransactionZodSchema = z.object({
  _id: z.string(),
  code: z.string(),
  total: z.number(),
  balanceAfter: z.number(),
  orders: z.array(z.string()),
  owner: z.string(),
  method: z.string(),
  type: z.string(),
  currency: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Transaction = z.infer<typeof TransactionZodSchema>;

export const InvoiceZodSchema = z.object({
  invoiceNumber: z.string(),
  period: z.string(),
  currency: z.string(),
  total: z.string(),
  flag: z.string(),
  region: z.string(),
  createdAt: z.string(), // Consider using z.date() if it's in date format
});

export type Invoice = z.infer<typeof InvoiceZodSchema>;
