import type { PaginationState } from '@tanstack/react-table';
import { handleAxiosError } from 'shared';

import type { MockupDownloadResponse, MockupsResponse } from '@/interfaces/mockup';
import { CustomAxios } from '@/utils';

const getMockups = async (param: PaginationState, searchValue: string): Promise<MockupsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined) {
      const { data } = await CustomAxios.get<MockupsResponse>('/mockups');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const { data } = await CustomAxios.get<MockupsResponse>(
      `/mockups?page=${pageIndex}&limit=${pageSize}&sort=createdAt&search=${searchValue}`,
    );

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const downloadMockup = async (mockupId: string): Promise<MockupDownloadResponse> => {
  try {
    const { data } = await CustomAxios.post<MockupDownloadResponse>(`/mockups/${mockupId}/download`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const mockupService = {
  getMockups,
  downloadMockup,
};
