import type { Response } from 'shared';
import { z } from 'zod';

export const MailTemplateZodSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  lastEditedTime: z.date(),
});

export type MailTemplateDto = z.infer<typeof MailTemplateZodSchema>;

export type MailTemplatesResponse = {
  data: MailTemplateDto[] | null;
} & Response;
