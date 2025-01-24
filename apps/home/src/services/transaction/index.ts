import type { PaginationState } from '@tanstack/react-table';
import { handleAxiosError } from 'shared';

import { TransactionMethod, TransactionType } from '@/constants/transaction';
import { CustomAxios } from '@/utils';

export type ChangeBalanceTransactionDto = {
  email: string;
  note?: string;
  total: number;
  method: string;
  type: string;
  currency: string;
};

const changeBalance = async (changeBalanceTransactionDto: ChangeBalanceTransactionDto) => {
  try {
    const { data } = await CustomAxios.post(`/transactions/balance`, { ...changeBalanceTransactionDto });

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

const getTransaction = async (param: PaginationState, search?: string, filters: string[] = []) => {
  try {
    if (!param || param.pageIndex === undefined || param.pageSize === undefined || search === undefined) {
      const { data } = await CustomAxios.get('/transactions');

      return data;
    }
    const { pageIndex, pageSize } = param;
    const newPageIndex = pageIndex;
    const type = filters.filter((item) => TransactionType.includes(item));
    const method = filters.filter((item) => TransactionMethod.includes(item));
    const stringDate = filters.find((item) => item.indexOf('_DATE') > 0)?.replace('_DATE', '');
    const [from, to] = stringDate?.split(' - ') ?? ['', ''];

    const { data } = await CustomAxios.get(`/transactions`, {
      params: { pageIndex: newPageIndex, totalItem: pageSize, search: search ?? '', type, method, from, to },
    });

    return data;
  } catch (error: any) {
    return handleAxiosError(error);
  }
};

export const transactionService = {
  changeBalance,
  getTransaction,
};
