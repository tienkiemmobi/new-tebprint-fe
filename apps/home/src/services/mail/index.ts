import type { PaginationState } from '@tanstack/react-table';
import type { BooleanResponse } from 'shared';
import { handleAxiosError } from 'shared';

import type { MailTemplatesResponse } from '@/interfaces';
import { CustomAxios } from '@/utils';

export const getMailTemplates = async (param?: PaginationState, search?: string): Promise<MailTemplatesResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<MailTemplatesResponse>('mails');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const newPageIndex = Number(pageIndex);
    const { data } = await CustomAxios.get<MailTemplatesResponse>(
      `mails?page=${newPageIndex}&limit=${pageSize}&search=${search}`,
    );

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const syncTemplates = async (): Promise<BooleanResponse> => {
  try {
    const { data } = await CustomAxios.post<BooleanResponse>(`mails/sync-templates`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const mailService = {
  getMailTemplates,
  syncTemplates,
};
