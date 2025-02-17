import { handleAxiosError } from 'shared';

import { CustomAxios } from '@/utils';

const login = async (email: string, password: string, recaptchaToken: string) => {
  try {
    console.log(import.meta.env.PUBLIC_API_URL);

    const { data } = await CustomAxios.post('auth/login', { email, password, recaptchaToken });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const update = async (idUser: string, userValue: Record<string, string>) => {
  try {
    const { data } = await CustomAxios.patch(`users/${idUser}`, { ...userValue });

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const userService = {
  update,
  login,
};
