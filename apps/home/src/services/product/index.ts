import type { PaginationState } from '@tanstack/react-table';
import axios from 'axios';
import type { ImageResponse, ProductResponse, ProductsResponse, Response, UploadFileType } from 'shared';
import { handleAxiosError } from 'shared';

import type { NewProductPayLoadDto } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getProducts = async (param?: PaginationState, search?: string): Promise<ProductsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<ProductsResponse>('/products');

      return data;
    }

    const { pageIndex, pageSize } = param;

    const { data } = await CustomAxios.get<ProductsResponse>(
      `/products?page=${Number(pageIndex)}&limit=${1000}&search=${search}`,
    );

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const getProduct = async (id: string): Promise<ProductResponse> => {
  try {
    const { data } = await CustomAxios.get<ProductResponse>(`products/${id}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addOrEditProduct = async (data: NewProductPayLoadDto, id?: string): Promise<ProductResponse> => {
  const url = id ? `/products/${id}` : `/products`;
  let result = null;

  const variants = (data.variants || []).map((variant) => {
    const newVariant = { ...variant, Id: variant._id };
    delete newVariant._id;

    return newVariant;
  });
  const { mainImageId } = data;
  const { otherImageIds } = data;

  try {
    if (id) result = await CustomAxios.put<ProductResponse>(url, { ...data, mainImageId, otherImageIds, variants });
    else result = await CustomAxios.post<ProductResponse>(url, { ...data, mainImageId, otherImageIds, variants });

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const uploadImage = async (file: File, type: UploadFileType, signal?: AbortSignal): Promise<ImageResponse> => {
  try {
    if (signal) {
      const imageResult = await CustomAxios.post<ImageResponse>(
        `/upload`,
        { file, type },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
          signal,
        },
      );

      return imageResult.data;
    }
    const imageResult = await CustomAxios.post<ImageResponse>(
      `/upload`,
      { file, type },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      },
    );

    return imageResult.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return handleAxiosError(error.message);
    }

    return handleAxiosError(error);
  }
};

export const deleteProduct = async (id?: string): Promise<Response> => {
  try {
    const response = await CustomAxios.delete<Response>(`products/${id}`);

    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const productService = {
  getProducts,
  getProduct,
  addOrEditProduct,
  deleteProduct,
};
