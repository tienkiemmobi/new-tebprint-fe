import { handleAxiosError } from 'shared';

import type { GetProductVariantsByCodesResponse, ProductVariantResponse } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getProductVariantsByCodes = async (codes: string[]): Promise<GetProductVariantsByCodesResponse> => {
  try {
    const result = await CustomAxios.post<GetProductVariantsByCodesResponse>(`/product-variants/bulk`, {
      codes,
    });

    return result.data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const getProductVariant = async (id: string): Promise<ProductVariantResponse> => {
  try {
    const result = await CustomAxios.get<ProductVariantResponse>(`/product-variants/${id}`);

    return result.data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const productVariantService = {
  getProductVariantsByCodes,
  getProductVariant,
};
