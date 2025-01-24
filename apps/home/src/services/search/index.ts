import { handleAxiosError } from 'shared';

import { CustomAxios } from '@/utils';

type SearchPayload = {
  value: string;
  pageIndex: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-shadow
const search = async <T>(search: SearchPayload, endpoint: string): Promise<T | null> => {
  try {
    const { pageIndex, pageSize, value } = search;
    const newPageIndex = Number(pageIndex) + 1;
    const { data } = await CustomAxios.get(`/${endpoint}?page=${newPageIndex}&limit=${pageSize}&search=${value}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const searchService = {
  search,
};
