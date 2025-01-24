import axios from 'axios';

import { useAuthStore } from '@/store';

const { bearerToken } = useAuthStore.getState();

const CustomAxios = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL,
  headers: { Authorization: `Bearer ${bearerToken}` },
});

export { CustomAxios };
