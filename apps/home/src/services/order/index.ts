import type { PaginationState } from '@tanstack/react-table';
import type { BooleanResponse, OrderStatisticResponse, Response, ShippingAddressDto } from 'shared';
import { handleAxiosError } from 'shared';

import type {
  ArtworkImageDto,
  ExternalFileLinkResponse,
  MockupImageDto,
  OrderIssueDto,
  OrderItemResponse,
  OrderResponse,
  OrdersResponse,
  OrderSubmitDto,
  ReturnReasonDto,
} from '@/interfaces';
import type { OrderShippingDto } from '@/page-layouts/create-order/OrderShipping';
import type { UploadExternalFileLinkDto } from '@/page-layouts/orders/UploadExternalFileLinkDialog';
import { CustomAxios } from '@/utils';

const getOrders = async (
  param?: PaginationState,
  search?: string,
  statusParamUrl?: string,
  productParamUrl?: string,
  myStore?: string,
  pickedDate?: string,
): Promise<OrdersResponse> => {
  try {
    if (
      !param ||
      param.pageIndex === undefined ||
      param.pageSize === undefined ||
      search === undefined ||
      statusParamUrl === undefined ||
      productParamUrl === undefined ||
      myStore === undefined ||
      pickedDate === undefined
    ) {
      const { data } = await CustomAxios.get<OrdersResponse>('/orders');

      return data;
    }
    const { pageIndex, pageSize } = param;
    let [fromStr, toStr]: string[] = [];

    if (!pickedDate.includes('-') && pickedDate !== '') {
      const startOfDay = new Date(pickedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(pickedDate);
      endOfDay.setHours(23, 59, 59, 999);
      [fromStr, toStr] = [startOfDay.toString(), endOfDay.toString()];
    } else {
      [fromStr, toStr] = pickedDate.split('-').map((str) => str.trim());
    }

    const dateRangeObject = {
      from: fromStr ? new Date(fromStr).toISOString() : '',
      to: toStr ? new Date(toStr).toISOString() : '',
    };

    const queryParams = [
      `page=${pageIndex}`,
      `limit=${pageSize}`,
      `search=${search}`,
      `status=${statusParamUrl}`,
      `productId=${productParamUrl}`,
      `storeCode=${myStore}`,
      `from=${dateRangeObject.from}`,
      `to=${dateRangeObject.to}`,
    ];

    const apiUrlWithParams = `/orders?${queryParams.join('&')}`;

    const { data } = await CustomAxios.get<OrdersResponse>(apiUrlWithParams);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
const getStatistics = async (
  from?: string,
  to?: string,
  storeCode?: string,
  productId?: string,
): Promise<OrderStatisticResponse> => {
  try {
    // @ts-expect-error ts(2345)
    const searchParams = new URLSearchParams({
      from,
      to,
      storeCode,
      productId,
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of searchParams.entries()) {
      if (value === undefined) {
        searchParams.delete(key);
      }
    }

    const { data } = await CustomAxios.get<OrderStatisticResponse>(`/orders/statistic?${searchParams.toString()}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const importOrders = async (payload): Promise<Response> => {
  try {
    const { data } = await CustomAxios.post(`/orders/import`, payload);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const getOrderById = async (id: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.get<OrderResponse>(`/orders/${id}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const putRefundOrder = async (data: ReturnReasonDto, id: string): Promise<BooleanResponse> => {
  try {
    const result = await CustomAxios.put<BooleanResponse>(`/${id}/return`, { ...data });

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const issueOrder = async (data: OrderIssueDto, id: string): Promise<BooleanResponse> => {
  try {
    const result = await CustomAxios.post<BooleanResponse>(`/orders/${id}/issue`, { ...data });

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const createOrder = async (
  externalId: string,
  note: string,
  orderSubmit: OrderSubmitDto[],
  orderShippingInfo: OrderShippingDto,
  storeCode: string,
  designerName?: string,
): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`/orders`, {
      externalId,
      note,
      orderItems: orderSubmit,
      shipping: orderShippingInfo,
      storeCode,
      designerName,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
const getScanOrder = async (barcode: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.get<OrderResponse>(`/orders/scan/${barcode}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateReImageArtwork = async (
  lineItemId: string,
  artworkImagePayload: ArtworkImageDto,
  type: string,
): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.put<OrderResponse>(`/order-items/${lineItemId}/update-artwork`, {
      ...artworkImagePayload,
      type,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateReImageMockup = async (
  lineItemId: string,
  mockupImagePayload: MockupImageDto,
): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.put<OrderResponse>(`order-items/${lineItemId}/update-mockup`, {
      ...mockupImagePayload,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateOrderItemNote = async (note: string, paramId: string): Promise<OrderItemResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderItemResponse>(`order-items/${paramId}/update-note`, {
      note,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
export const updateOrderItemSystemNote = async (note: string, paramId: string): Promise<OrderItemResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderItemResponse>(`order-items/${paramId}/update-system-note`, {
      note,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateOrderNote = async (note: string, paramId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${paramId}/update-note`, {
      note,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updatePrivateNote = async (note: string, paramId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${paramId}/update-private-note`, {
      note,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateOrderSystemNote = async (note: string, paramId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${paramId}/update-system-note`, {
      note,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const calcPayOrders = async (orderIds: string[]) => {
  try {
    const { data } = await CustomAxios.post(`orders/calc-pay-orders`, {
      orderIds,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const payOrders = async (orderIds: string[]) => {
  try {
    const { data } = await CustomAxios.post(`orders/pay-orders`, {
      orderIds,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateExternalFileLinks = async (
  lineItemId: string,
  externalFileLinks: UploadExternalFileLinkDto['externalFileLinks'],
): Promise<ExternalFileLinkResponse> => {
  try {
    const { data } = await CustomAxios.put<ExternalFileLinkResponse>(`order-items/${lineItemId}/external-file-links`, {
      externalFileLinks,
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateStatus = async (orderId: string, status: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${orderId}/status`, JSON.stringify(status), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const printLabel = async (orderId: string) => {
  try {
    const { data } = await CustomAxios.post(`orders/${orderId}/print-label`, '', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const getOnosProducts = async () => {
  try {
    const { data } = await CustomAxios.get(`/orders/onos-products`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const createShipmentOrder = async (
  orderId: string,
  createShipmentDto: {
    onosProductId: string;
    onosProductSku: string;
    onosProductName: string;
    weight: number;
    width: number;
    height: number;
    length: number;
    skipAddressCheck: boolean;
  },
): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(
      `/orders/${orderId}/create-shipment`,
      JSON.stringify(createShipmentDto),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateShippingAddress = async (
  orderId: string,
  shippingAddress: ShippingAddressDto,
): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(
      `orders/${orderId}/update-shipping-address`,
      JSON.stringify(shippingAddress),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const setLineItemProduced = async (lineItemId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`order-items/${lineItemId}/set-produced`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const deleteOrder = async (orderId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${orderId}/delete`, '', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const cancelOrder = async (orderId: string): Promise<OrderResponse> => {
  try {
    const { data } = await CustomAxios.post<OrderResponse>(`orders/${orderId}/cancel`, '', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const orderService = {
  getOrders,
  getOrderById,
  cancelOrder,
  putRefundOrder,
  importOrders,
  createOrder,
  getStatistics,
  getScanOrder,
  updateReImageArtwork,
  updateOrderItemNote,
  updateOrderNote,
  updatePrivateNote,
  updateOrderSystemNote,
  updateOrderItemSystemNote,
  calcPayOrders,
  payOrders,
  updateExternalFileLinks,
  updateReImageMockup,
  issueOrder,
  updateStatus,
  getOnosProducts,
  createShipmentOrder,
  printLabel,
  updateShippingAddress,
  setLineItemProduced,
  deleteOrder,
};
