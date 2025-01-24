import { handleAxiosError } from 'shared';

import { CustomAxios } from '@/utils';

export const getShipmentEvents = async (orderId: string) => {
  try {
    const { data } = await CustomAxios.get(`/shipment-event?orderId=${orderId}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const shipmentEventService = {
  getShipmentEvents,
};
