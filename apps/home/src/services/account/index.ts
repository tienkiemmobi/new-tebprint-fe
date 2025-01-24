import type { PaginationState } from '@tanstack/react-table';
import type { BooleanResponse, ChangePasswordDto, NewUserDto, UsersResponse } from 'shared';
import { handleAxiosError } from 'shared';

import type { AccountResponse, TwoFaSecretResponse, Verify2FaOtpPayloadDto, Verify2FaOtpResponse } from '@/interfaces';
import type { NotificationSettingUserDto, UpdateUserDto } from '@/page-layouts';
import { CustomAxios } from '@/utils';

export const getMe = async (): Promise<AccountResponse> => {
  try {
    const { data } = await CustomAxios.get(`${import.meta.env.PUBLIC_API_URL}/auth/me`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getUsers = async (param: PaginationState, search?: string, role?: string): Promise<UsersResponse> => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get<UsersResponse>('/users');

      return data;
    }

    const { pageIndex, pageSize } = param;
    const searchParams = new URLSearchParams({
      page: pageIndex.toString(),
      limit: pageSize.toString(),
      search,
      ...(role && { role }),
    });

    const { data } = await CustomAxios.get<UsersResponse>(`/users?${searchParams.toString()}`);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addUser = async (data: NewUserDto): Promise<UsersResponse> => {
  try {
    const result = await CustomAxios.post('/auth/register', data);

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const UpdateUserInfo = async (data: UpdateUserDto): Promise<AccountResponse> => {
  try {
    const result = await CustomAxios.patch<AccountResponse>('/users/update', data);

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const resetPassword = async (emailValue: string): Promise<BooleanResponse | null> => {
  try {
    const result = await CustomAxios.post('/users/reset-password', { email: emailValue });

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const get2faSecret = async (): Promise<TwoFaSecretResponse> => {
  try {
    const { data } = await CustomAxios.post<TwoFaSecretResponse>('/users/2fa-secret');

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const verify2FaOtp = async (payload: Verify2FaOtpPayloadDto): Promise<Verify2FaOtpResponse> => {
  try {
    const { data } = await CustomAxios.post<Verify2FaOtpResponse>('/users/verify-2fa-otp', payload);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const verifyReCaptcha = async (verifyReCaptchaValue: string): Promise<BooleanResponse | null> => {
  try {
    const { data } = await CustomAxios.post('/recaptcha/verify-captcha', { verifyReCaptchaValue });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const requestPasswordChange = async (data: ChangePasswordDto) => {
  try {
    const result = await CustomAxios.post('/users/change-password', data);

    return result.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const notificationSettings = async (payload: NotificationSettingUserDto) => {
  try {
    const { data } = await CustomAxios.post('users/settings/notifications', payload);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getNotificationSetting = async () => {
  try {
    const { data } = await CustomAxios.get('users/settings/notifications');

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const myAccountService = {
  requestPasswordChange,
  getMe,
  getUsers,
  addUser,
  UpdateUserInfo,
  resetPassword,
  get2faSecret,
  verify2FaOtp,
  verifyReCaptcha,
  notificationSettings,
  getNotificationSetting,
};
