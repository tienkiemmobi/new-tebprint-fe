import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import type { Product, ProductVariant } from 'shared';
import {
  Flag,
  Pagination,
  Search,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui';
import { useStore } from 'zustand';

import { ListProducts } from '@/components';
import { Dropdown } from '@/components/molecules';
import { DEFAULT_PAGINATION } from '@/constants';
import { Footer } from '@/layouts';
import type { ProductStore } from '@/store';
import { useProductStore } from '@/store';

type ProductProps = {
  listProduct?: Product[];
};
const Products: React.FC<ProductProps> = (props) => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const useFilter = <T,>(selector: (state: ProductStore) => T) => useStore(useProductStore, selector);
  const { products, selectedVariants, selectedCategories, setProducts } = useFilter((state) => state);
  const { listProduct } = props;
  const [searchTerm, setSearchTerm] = useState('');

  const [categoryFilterOptions, setCategoryFilterOptions] = useState<string[]>([]);
  const [listSizes, setListSizes] = useState<string[]>([]);
  const [listColor, setListColor] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [sortingField, setSortingField] = useState<string>('popularity');
  const [currentData, setCurrentData] = useState<Product[]>([]);

  // const [allVariants, setAllVariants] = useState<Partial<Record<keyof IVariant, string[]>>[]>([]);
  const handleVariant = useCallback(
    (type: Extract<keyof ProductVariant, 'size' | 'color'>) => {
      let productsToUse: Product[] = products;
      if (selectedCategories && selectedCategories.length > 0) {
        productsToUse = products.filter((product) => selectedCategories.includes(product.category.name));
      }

      const allVariant = Array.from(
        new Set(productsToUse?.flatMap((product) => product.variants?.map((v) => v[type]))),
      );
      // setAllVariants((prev) => [...prev, { [type]: allVariant }]);
      if (type === 'size') return setListSizes(allVariant);
      if (type === 'color') return setListColor(allVariant);

      return '';
    },
    [products, selectedCategories],
  );

  const handleSelectChange = (value: string) => {
    setSortingField(value);
  };

  function getDataByPagination(params: Product[], paginationPage: PaginationState) {
    const startIndex = (paginationPage.pageIndex - 1) * paginationPage.pageSize;
    const endIndex = startIndex + paginationPage.pageSize;

    return params.slice(startIndex, endIndex);
  }

  useEffect(() => {
    if (listProduct) {
      setProducts(listProduct);
    }
  }, []);

  useEffect(() => {
    const filterDataDropdown = () => {
      const categorySet = new Set(products?.map((product) => product?.category?.name));
      const uniqueCategories = Array.from(categorySet);
      uniqueCategories.unshift('All');
      setCategoryFilterOptions(uniqueCategories);
      handleVariant('size');
      handleVariant('color');
    };
    filterDataDropdown();
  }, [products, selectedCategories]);

  useEffect(() => {
    const searchResults = products?.filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const updatedFilteredProducts = searchResults?.filter((product) => {
      const isVariantMatches =
        !selectedVariants.length ||
        product.variants.some((variant) => {
          return selectedVariants.includes(`${variant.size}Size`) || selectedVariants.includes(`${variant.color}Color`);
        });

      let isCategoryMatch = false;
      if (selectedCategories === 'All') {
        isCategoryMatch = true;
      } else {
        isCategoryMatch = !selectedCategories || product.category?.name === selectedCategories;
      }

      return (!selectedCategories && !selectedVariants.length) || (isVariantMatches && isCategoryMatch);
    });

    switch (sortingField) {
      case 'lowestPrice':
        updatedFilteredProducts.sort((a, b) => {
          return a.price - b.price;
        });
        break;
      case 'highestPrice':
        updatedFilteredProducts.sort((a, b) => {
          return b.price - a.price;
        });
        break;
      case 'latest':
        updatedFilteredProducts.sort((a, b) => {
          return new Date(b?.createdAt || '').getTime() - new Date(a?.createdAt || '').getTime();
        });
        break;
      default:
        break;
    }
    setFilteredProducts(updatedFilteredProducts);
    setCurrentData(getDataByPagination(updatedFilteredProducts, pagination));
  }, [
    selectedVariants,
    selectedCategories,
    products,
    sortingField,
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
  ]);

  return (
    <>
      <div className="ml-0 mt-[78px] max-h-0 min-h-[calc(100vh-78px)] w-full overflow-y-auto">
        <div className="mx-auto w-full p-4">
          <Search
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
            onSearch={(value) => {
              setSearchTerm(value);
            }}
          />
          <div className="pb-4 pt-8">
            <a href="/catalog" className="text-primary">
              Catalog
            </a>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 pb-6 md:flex-row">
            <h4 className="w-full font-bold text-color md:w-1/4 lg:text-[22px]">All Products</h4>
            <div className="flex w-full items-center sm:justify-end md:w-3/4 md:justify-end lg:justify-end">
              <span className="pr-2">Sort by</span>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger className="h-12 w-full rounded-[3px] border-[#C4C7C8] md:w-[241px] lg:w-[241px]">
                  <SelectValue placeholder="Popularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="lowestPrice">Lowest price</SelectItem>
                    <SelectItem value="highestPrice">Highest price</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <h2 className="my-4 text-center text-warning">
            Xem các sản phẩm sản xuất tại US tại đây:{' '}
            <a className="text-primary" href="/products?category=Sản%20xuất%20US" target="_blank">
              <span className="text-[red]">US</span>
            </a>
            <br></br>
            Seller không có sẵn file sản xuất (file cắt và file in) Tebprint sẽ hỗ trợ với chi phí từ 1-2$ cho 1 đơn
            hàng
          </h2>
          {/* <p className="pb-10 text-[14px] font-normal leading-6 text-[#686F71]">
            Filter to find out your favorite product from our catalog.
          </p> */}
          <div className="block w-full justify-center gap-2 md:flex md:justify-between">
            <div className="mb-8 h-auto w-full bg-transparent pr-6 md:block md:h-[300px] md:w-[28%] lg:w-[28%] xl:w-[28%]">
              <div className="w-full">
                <div className="border-b border-gray-400">
                  <Dropdown
                    typeElement="radioButton"
                    rightIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronDown} />}
                    rightToggleIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronUp} />}
                    statusDropdown=""
                    title="Category"
                    listItems={categoryFilterOptions}
                    isOpenDropDown={true}
                  />
                </div>
                <div className="border-b border-gray-400">
                  <Dropdown
                    rightIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronDown} />}
                    rightToggleIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronUp} />}
                    title="Color"
                    listItems={listColor}
                  />
                </div>
                <div className="border-b border-gray-400">
                  <Dropdown
                    rightIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronDown} />}
                    rightToggleIcon={<FontAwesomeIcon className="h-3 w-3" icon={faChevronUp} />}
                    title="Size"
                    listItems={listSizes}
                  />
                </div>
              </div>
            </div>
            <div className="h-full w-full md:w-[72%] lg:w-[72%] xl:w-[72%]">
              <ListProducts
                className="flex w-full justify-center gap-2 px-2 sm:w-1/2 md:w-1/2 lg:w-1/3"
                listProducts={currentData}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Pagination
              name="Products"
              total={filteredProducts.length}
              showViewPerPage={false}
              showInputPagination={{ showInput: false, showTotalOfPage: false }}
              setPagination={setPagination}
              isOffline={true}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
      <Footer classes="min-h-[100px] w-full px-6 pt-[96px] md:w-full lg:w-[1150px]" />
    </>
  );
};

export { Products };
