import { Status } from 'shared';
import { create } from 'zustand';

import type { CustomStoreDto } from '@/interfaces';

type Store = {
  singleStore: CustomStoreDto;
  updateSingleStore: (newData: Partial<CustomStoreDto>) => void;
};

const useSingleStore = create<Store>((set) => ({
  singleStore: {
    type: '',
    _id: '',
    name: '',
    description: '',
    ordersCount: [],
    status: Status.Active,
  },
  updateSingleStore: (newData) => {
    set((state) => ({
      singleStore: { ...state.singleStore, ...newData },
    }));
  },
}));

export { useSingleStore };
