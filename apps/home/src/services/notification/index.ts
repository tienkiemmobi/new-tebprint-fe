import type { PaginationState } from '@tanstack/react-table';
import type { BooleanResponse } from 'shared';
import { handleAxiosError } from 'shared';

import type { AllNotificationsResponse, NotificationsResponse } from '@/interfaces';
import { CustomAxios } from '@/utils';

const getNotifications = async (param?: PaginationState): Promise<AllNotificationsResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined) {
      const { data } = await CustomAxios.get<AllNotificationsResponse>('/notifications');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const { data } = await CustomAxios.get(`/notifications?page=${pageIndex}&limit=${pageSize}&sortBy=createdAt`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const getNotificationDetail = async (param?: string): Promise<NotificationsResponse> => {
  try {
    const { data } = await CustomAxios.get<NotificationsResponse>(`/notifications/${param}`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const readAllNotification = async (): Promise<BooleanResponse> => {
  try {
    const { data } = await CustomAxios.put<BooleanResponse>(`/notifications/read-all`);

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const notificationService = {
  getNotifications,
  getNotificationDetail,
  readAllNotification,
};
