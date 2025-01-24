import type { Response } from 'shared';
import { z } from 'zod';

export type NotificationTabType = 'all' | 'order' | 'system' | 'account';

export type NotificationTab = {
  value: NotificationTabType;
  label: string;
};

export const NotificationZodSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  seen: z.boolean(),
  user: z.string(),
  order: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Notification = z.infer<typeof NotificationZodSchema>;

export const AllNotificationsZodSchema = NotificationZodSchema.pick({
  _id: true,
  title: true,
});

export type AllNotificationsDto = z.infer<typeof AllNotificationsZodSchema>;

export type AllNotificationsResponse = {
  data: AllNotificationsDto[];
  total: number;
} & Response;

export type NotificationsResponse = {
  total: number;
  data: Notification;
} & Response;
