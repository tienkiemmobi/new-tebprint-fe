import { useEffect, useState } from 'react';
import type { Product } from 'shared';
import { Flag, Search, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from 'ui';

import { ListProducts } from '@/components';
import { Footer } from '@/layouts';

type HomeProps = {
  listProduct: Product[];
};

const CatalogPage: React.FC<HomeProps> = (props) => {
  const { listProduct } = props;

  const [categoryFilterOptions, setCategoryFilterOptions] = useState<string[]>([]);

  const getProductsByCategory = (category: string) => {
    const filteredProducts = listProduct.filter((product) => product.category?.name === category);

    filteredProducts.sort((a, b) => new Date(b?.createdAt || '').getTime() - new Date(a?.createdAt || '').getTime());

    const latestFourProducts = filteredProducts.slice(0, 4);

    return latestFourProducts;
  };

  useEffect(() => {
    const getUniqueCategories = () => {
      const categorySet = new Set(listProduct?.map((product) => product?.category?.name));
      const uniqueCategories = Array.from(categorySet);
      setCategoryFilterOptions(uniqueCategories);
    };
    getUniqueCategories();
  }, [listProduct]);

  return (
    <>
      <div className="w-full p-4">
        <Search
          className="mt-[78px]"
          searchContent={
            <div className="flex w-1/5 items-center justify-end pl-[50px] md:w-1/4">
              <span className="mr-3 hidden md:block">Currency</span>
              <div className="md:w-[112px]">
                <Select>
                  <SelectTrigger className="h-12 w-[70px] rounded-[3px] border-[#C4C7C8] md:w-full">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="USD">
                        <span className="flex items-center gap-4">
                          <Flag className="hidden md:block" code="US" />
                          <span>US</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="VN" className="flex items-center gap-2">
                        <span className="flex items-center gap-4">
                          <Flag className="hidden md:block" code="VN" />
                          <span>VND</span>
                        </span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />
        <div>
          <h1 className="py-8 text-center text-4xl font-bold leading-[56px] text-color md:text-start">
            TebPrint's Product Catalog
          </h1>
          <div className="relative w-full">
            <img className="w-full" src="https://i.imgur.com/Uj5wk7b.png" alt="Banner" />

            <div className="absolute left-32 top-[50%] w-[469px] text-white"></div>
          </div>
          <div className="py-[20px]">
            {categoryFilterOptions.map((category) => {
              return (
                <ListProducts
                  key={category}
                  className="flex w-full justify-center md:w-2/4 lg:w-1/4 xl:w-1/4"
                  title={category}
                  listProducts={getProductsByCategory(category)}
                />
              );
            })}
          </div>
        </div>
      </div>
      <Footer classes="min-h-[100px] w-full px-6 pt-[96px] md:w-full lg:w-[1150px]" />
    </>
  );
};

export { CatalogPage };
