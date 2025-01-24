import { ChevronRight, Dot, SearchCode } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import type { Product } from 'shared';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, Search } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import { productService } from '@/services';

import type { CreateOrderState, OrderState } from '.';

type SelectProductVariantDialogState = {
  isDialogOpen: boolean;
  isDialogPending: boolean;
  products?: Product[];
  productWithOneVariants?: Product[];
};

type SelectProductVariantDialogProps = {
  setCreateOrderState: React.Dispatch<React.SetStateAction<CreateOrderState>>;
};

export type SelectProductVariantDialogRef = {
  triggerOpenDialog: () => void;
};

const SelectProductVariantDialog = forwardRef<SelectProductVariantDialogRef, SelectProductVariantDialogProps>(
  ({ setCreateOrderState }, ref): JSX.Element => {
    const [selectProductVariantDialogState, setSelectProductVariantDialogState] =
      useState<SelectProductVariantDialogState>({
        isDialogOpen: false,
        isDialogPending: false,
      });

    const handleOpenDialog = () => {
      setSelectProductVariantDialogState((pre) => ({ ...pre, isDialogOpen: true }));
    };

    const handleCloseDialog = () => {
      setSelectProductVariantDialogState((pre) => ({ ...pre, isDialogOpen: false }));
    };

    const fetchProducts = async () => {
      const productResponse = await productService.getProducts();
      if (!productResponse.success || !productResponse.data) {
        toast.error(productResponse.message);

        return;
      }

      setSelectProductVariantDialogState((pre) => ({
        ...pre,
        products: productResponse?.data || [],
      }));
    };

    const handleSelectVariant = (productId: string, variantId: string, quantity?: number) => {
      const addedQuantity = quantity || 1;

      setCreateOrderState((pre) => {
        const productAdded = selectProductVariantDialogState.products?.find((item) => item._id === productId);
        if (!productAdded) return pre;

        const orderExisted = pre.orders.some((item) => item.variant.variantId === variantId);

        if (orderExisted) {
          toast.error('This variant you already added to the order');

          return pre;
        }

        const newOrder: OrderState[] = [
          ...pre.orders,
          {
            product: productAdded,
            variant: { identifier: new Date().getTime().toString(), variantId, quantity: addedQuantity },
            artworkImages: { front: '', back: '' },
            mockupImages: { mockup1: '', mockup2: '' },
            artworks: [],
            mockups: [],
          },
        ];

        return {
          ...pre,
          orders: newOrder,
        };
      });

      setSelectProductVariantDialogState((pre) => ({
        ...pre,
        isDialogOpen: false,
        products: undefined,
        productWithOneVariants: undefined,
      }));
    };

    const handleClickSelectProduct = (product: Product) => {
      if (product.variants.length === 0) return;
      if (product.variants.length === 1) {
        handleSelectVariant(product._id, product.variants[0]?._id || '');

        return;
      }

      const productWithOneVariants = product.variants.map((item) => ({ ...product, variants: [item] }));

      setSelectProductVariantDialogState((pre) => ({
        ...pre,
        productWithOneVariants,
      }));
    };

    const handleBackMyProduct = () => {
      setSelectProductVariantDialogState((pre) => ({
        ...pre,
        productWithOneVariants: undefined,
      }));
    };

    const handleSearchProduct = async (value: string) => {
      setSelectProductVariantDialogState((pre) => ({ ...pre, products: undefined, productWithOneVariants: undefined }));

      const productsResponse = await productService.getProducts(DEFAULT_PAGINATION, value);
      if (!productsResponse.success || !productsResponse.data) {
        setSelectProductVariantDialogState((pre) => ({ ...pre, products: [] }));
        toast.error(productsResponse.message);

        return;
      }
      const productDataResponse = [...productsResponse.data];
      setSelectProductVariantDialogState((pre) => ({ ...pre, products: [...productDataResponse] }));
    };

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        handleOpenDialog();
      },
    }));

    useEffect(() => {
      if (selectProductVariantDialogState.isDialogOpen) {
        fetchProducts();
      }

      if (!selectProductVariantDialogState.isDialogOpen) {
        setSelectProductVariantDialogState((pre) => ({
          ...pre,
          products: undefined,
          productWithOneVariants: undefined,
        }));
      }
    }, [selectProductVariantDialogState.isDialogOpen]);

    return (
      <Dialog open={selectProductVariantDialogState.isDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="!w-[800px] max-w-[100%] overflow-y-hidden rounded-[6px]"
          showClose={false}
        >
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(70vh-80px)] overflow-y-auto overflow-x-hidden border-b border-[#e3e4e5] p-6">
            <Search
              placeholder="Search products by name, tag, code, sku, variant..."
              className="mt-0"
              loading={selectProductVariantDialogState.products === undefined}
              onSearch={handleSearchProduct}
            />
            {selectProductVariantDialogState.products === undefined ? (
              <div className="flex min-h-[100px] w-full items-center justify-center">
                <span className="dsy-loading dsy-loading-spinner dsy-loading-lg"></span>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`pointer-events-none text-[#9fa4a5] ${
                      selectProductVariantDialogState.productWithOneVariants &&
                      'pointer-events-auto cursor-pointer text-[#29ab51]'
                    }`}
                    onClick={handleBackMyProduct}
                  >
                    All products
                  </span>

                  {selectProductVariantDialogState.productWithOneVariants && (
                    <p className="pointer-events-none text-[#9fa4a5]">
                      / {selectProductVariantDialogState.productWithOneVariants[0]?.title}
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  {selectProductVariantDialogState.products.length === 0 ? (
                    <div className="h-[100px] select-none text-center leading-[100px]">Product not found.</div>
                  ) : (
                    <>
                      {(
                        selectProductVariantDialogState.productWithOneVariants ||
                        selectProductVariantDialogState.products
                      ).map((productItem, index) => (
                        <div
                          key={`${productItem._id}-${index}`}
                          className={`mt-1 flex items-center justify-between overflow-hidden rounded-[5px] border-b border-[#e3e4e5] p-2 pr-4 ${
                            productItem.variants.length === 0 ? 'bg-[#e5dfdf]' : 'cursor-pointer hover:bg-[#f7f7f7]'
                          }`}
                          onClick={() => handleClickSelectProduct(productItem)}
                          data-select-product
                        >
                          <div className="flex items-start gap-3">
                            <div className="group/orderProduct relative h-[96px] w-[96px] overflow-hidden rounded-[3px] border border-[#e3e4e5]">
                              <img
                                src={productItem.mainImage.preview}
                                alt=""
                                width={168}
                                height={168}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                              <div className="invisible absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center border border-[#c4c7c8] bg-background transition-all group-hover/orderProduct:visible">
                                <SearchCode />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <p className="font-bold">{productItem.title}</p>
                              {productItem.variants.length === 0 && <p>Not available!</p>}
                              {productItem.variants.length === 1 ? (
                                <p className="flex">
                                  ${productItem.variants[0]?.price} <Dot className="h-4 w-4" />
                                  {productItem.variants[0]?.color} / {productItem.variants[0]?.size} / {''}
                                  {productItem.variants[0]?.style}
                                </p>
                              ) : (
                                <p className="flex">
                                  From ${productItem.price} <Dot className="h-4 w-4" />
                                  {productItem.variants.length} variants
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            {productItem.variants.length > 1 && <ChevronRight className="h-4 w-4" />}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogClose onClick={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    );
  },
);

export { SelectProductVariantDialog };
