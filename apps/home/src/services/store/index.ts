import type { PaginationState } from '@tanstack/react-table';
import { handleAxiosError } from 'shared';

import type { CreateStoreDto, StoreResponse, StoresResponse, UpdateStoreDto } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getStores = async (param?: PaginationState, search?: string): Promise<StoresResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<StoresResponse>('stores');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const newPageIndex = Number(pageIndex);
    const { data } = await CustomAxios.get<StoresResponse>(
      `stores?page=${newPageIndex}&limit=${pageSize}&search=${search}`,
    );

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const getStoreDetail = async (param?: string): Promise<StoreResponse> => {
  try {
    const { data } = await CustomAxios.get(`stores/${param}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const createNewStore = async (addStorePayLoad: CreateStoreDto) => {
  try {
    const { data } = await CustomAxios.post(`stores`, { ...addStorePayLoad });

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const updateStore = async (updateStorePayLoad: UpdateStoreDto, param?: string) => {
  try {
    const { data } = await CustomAxios.patch(`/stores/${param}`, {
      ...updateStorePayLoad,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteStore = async (param?: string) => {
  try {
    const { data } = await CustomAxios.delete(`/stores/${param}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const storeService = {
  getStores,
  getStoreDetail,
  createNewStore,
  updateStore,
  deleteStore,
};
