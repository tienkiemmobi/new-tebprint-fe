import type { PaginationState } from '@tanstack/react-table';
import { handleAxiosError } from 'shared';

import type { ContactResponse, ContactsResponse, CreateContactDto } from '@/interfaces';
import { CustomAxios } from '@/utils';

const createNewContact = async (payload: CreateContactDto): Promise<ContactResponse> => {
  try {
    const { data } = await CustomAxios.post<ContactResponse>(`contacts`, { ...payload });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const getContacts = async (param?: PaginationState, search?: string): Promise<ContactsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<ContactsResponse>('contacts');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const { data } = await CustomAxios.get(`contacts?page=${Number(pageIndex)}&limit=${pageSize}&search=${search}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const contactService = {
  createNewContact,
  getContacts,
};
