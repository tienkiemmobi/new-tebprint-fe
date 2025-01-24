import type { PaginationState } from '@tanstack/react-table';
import type { SystemLogsResponse } from 'shared';
import { handleAxiosError } from 'shared';

import { CustomAxios } from '@/utils';

const getSystemLogs = async (param?: PaginationState, search?: string): Promise<SystemLogsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<SystemLogsResponse>('system-logs');

      return data;
    }
    const { pageIndex, pageSize } = param;

    const { data } = await CustomAxios.get<SystemLogsResponse>(
      `system-logs?page=${Number(pageIndex)}&limit=${pageSize}&search=${search}`,
    );

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const systemLogService = {
  getSystemLogs,
};
