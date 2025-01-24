import type { NewRoleDto, RoleResponse, RolesResponse, UpdateRoleDto } from 'shared';
import { handleAxiosError } from 'shared';

import { CustomAxios } from '@/utils';

const getRoles = async (): Promise<RolesResponse> => {
  try {
    const { data } = await CustomAxios.get<RolesResponse>('/roles');

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
const createRole = async (payload: NewRoleDto): Promise<RoleResponse> => {
  try {
    const { data } = await CustomAxios.post<RoleResponse>('/roles', payload);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const updateRole = async (roleId: string, payload: UpdateRoleDto): Promise<RoleResponse> => {
  try {
    const { data } = await CustomAxios.patch<RoleResponse>(`/roles/${roleId}`, payload);

    return data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const roleService = {
  getRoles,
  updateRole,
  createRole,
};
