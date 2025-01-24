import type { PaginationState } from '@tanstack/react-table';
import type { BooleanResponse } from 'shared';
import { handleAxiosError } from 'shared';

import type { BlogsResponse } from '@/interfaces';
import { CustomAxios } from '@/utils';

export const getBlogs = async (param?: PaginationState, search?: string): Promise<BlogsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get('blogs');

      return data;
    }

    const { pageIndex, pageSize } = param;
    const newPageIndex = Number(pageIndex);
    const { data } = await CustomAxios.get<BlogsResponse>(
      `blogs?page=${newPageIndex}&limit=${pageSize}&search=${search}`,
    );

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const getBlogBySlug = async (slug: string | undefined): Promise<BlogsResponse> => {
  try {
    const { data } = await CustomAxios.get<BlogsResponse>(`blogs/${slug}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const sync = async (): Promise<BooleanResponse> => {
  try {
    const { data } = await CustomAxios.post<BooleanResponse>(`blogs/sync`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const blogService = {
  getBlogs,
  getBlogBySlug,
  sync,
};
