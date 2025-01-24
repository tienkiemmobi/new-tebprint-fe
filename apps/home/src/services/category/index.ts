import type { PaginationState } from '@tanstack/react-table';
import type { Response } from 'shared';
import { handleAxiosError } from 'shared';

import type { CategoriesResponse, CategoryResponse, NewCategoryDto, UpdateCategoryDto } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getCategories = async (param?: PaginationState): Promise<CategoriesResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined) {
      const { data } = await CustomAxios.get<CategoriesResponse>('/categories');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const { data } = await CustomAxios.get(`/categories?page=${pageIndex}&limit=${pageSize}&sortBy=createdAt`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const getCategoryDetail = async (param?: string): Promise<CategoryResponse> => {
  try {
    const { data } = await CustomAxios.get<CategoryResponse>(`/categories/${param}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const createCategory = async (payload: NewCategoryDto): Promise<CategoryResponse> => {
  try {
    const { data } = await CustomAxios.post<CategoryResponse>(`/categories`, payload);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const updateCategory = async (payload: UpdateCategoryDto, categoryId?: string): Promise<CategoryResponse> => {
  try {
    const { data } = await CustomAxios.put<CategoryResponse>(`/categories/${categoryId}`, payload);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const deleteCategory = async (param?: string): Promise<Response> => {
  try {
    const { data } = await CustomAxios.delete<Response>(`/categories/${param}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const getAllCategories = async (): Promise<CategoriesResponse> => {
  try {
    const { data } = await CustomAxios.get<CategoriesResponse>(`/categories/all`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const categoryService = {
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
