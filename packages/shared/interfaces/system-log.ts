import { z } from 'zod';

import type { Response } from './baseTemplate';
import { UserZodSchema } from './user';

export const SystemLogInfoZodSchema = z.object({
  user: UserZodSchema,
  action: z.string(),
  url: z.string(),
  message: z.string(),
  query: z.record(z.unknown()).optional(),
  params: z.record(z.unknown()).optional(),
});

export type SystemLogInfo = z.infer<typeof SystemLogInfoZodSchema>;

export const SystemLogZodSchema = z.object({
  date: z.string(),
  info: SystemLogInfoZodSchema,
});

export type SystemLog = z.infer<typeof SystemLogZodSchema>;

export type SystemLogsResponse = {
  data?: SystemLog[];
} & Response;
