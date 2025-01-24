import type { Product } from 'shared';
import { createStore } from 'zustand/vanilla';

import { productService } from '@/services';

type PropertyType = 'selectedVariants' | 'selectedCategories';

type ProductStore = {
  products: Product[];
  isLoading: boolean;
  errMessage: string;
  selectedVariants: string[];
  selectedCategories: string;
  toggleProperty: (property: PropertyType, value: string) => void;
  getProducts: () => void;
  setProducts: (ListProduct: Product[]) => void;
};

const useProductStore = createStore<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  errMessage: '',
  selectedVariants: [],
  selectedCategories: '',

  toggleProperty: (property, value) =>
    set((state) => {
      const { selectedVariants } = state;
      const isSelected = property === 'selectedVariants' && selectedVariants.includes(value);
      const newSelection = isSelected
        ? selectedVariants.filter((item) => item !== value)
        : [...selectedVariants, value];

      return property === 'selectedVariants' ? { selectedVariants: newSelection } : { selectedCategories: value };
    }),

  getProducts: async () => {
    // const { totalItem, pageIndex } = useProductStore.getState();
    set({ isLoading: true });
    try {
      const productStoreResponse = await productService.getProducts();
      if (!productStoreResponse.success || !productStoreResponse.data) {
        set({ products: [], isLoading: false });

        return;
      }

      set({ products: productStoreResponse.data, isLoading: false });
    } catch (error: any) {
      set({ errMessage: error.message, isLoading: false });
    }
  },
  setProducts: (ListProduct) => {
    try {
      set({ products: ListProduct });
    } catch (error: any) {
      set({ errMessage: error.message });
    }
  },
}));

export { type ProductStore, useProductStore };
