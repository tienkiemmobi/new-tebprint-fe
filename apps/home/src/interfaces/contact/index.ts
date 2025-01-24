import type { Response } from 'shared';
import { z } from 'zod';

export const ContactZodSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  webUrl: z.string().optional(),
});

export type Contact = z.infer<typeof ContactZodSchema>;

export const CreateContactZodSchema = ContactZodSchema.omit({
  id: true,
});

export type CreateContactDto = z.infer<typeof CreateContactZodSchema>;

export type ContactResponse = {
  data: Contact | null;
} & Response;

export type ContactsResponse = {
  data: Contact[] | null;
} & Response;
