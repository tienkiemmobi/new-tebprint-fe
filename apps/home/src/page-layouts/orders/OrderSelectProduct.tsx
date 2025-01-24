import { Dot, Filter, SearchCode } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import type { Product } from 'shared';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Search } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { OrderSelectDialog } from '@/page-layouts';
import { productService } from '@/services';

type OrderSelectProductProps = {
  open: boolean;
  myProduct?: Product[];
  setOrderSelectDialog: React.Dispatch<React.SetStateAction<OrderSelectDialog>>;
  handleSelectProduct: (product: Product) => void;
};

const OrderSelectProduct = ({
  open,
  myProduct,
  setOrderSelectDialog,
  handleSelectProduct,
}: OrderSelectProductProps) => {
  const fetchProducts = async () => {
    const productResponse = await productService.getProducts();
    if (!productResponse.success || !productResponse.data) {
      toast.error(productResponse.message);

      return;
    }

    setOrderSelectDialog((pre) => ({
      ...pre,
      myProduct: productResponse?.data || [],
    }));
  };

  useEffect(() => {
    if (open) {
      fetchProducts();
    } else {
      setOrderSelectDialog((pre) => ({ ...pre, myProduct: undefined }));
    }
  }, [open]);

  const handleToggleDialog = () => {
    setOrderSelectDialog((pre) => ({
      ...pre,
      isDialogSelectProductOpen: !pre.isDialogSelectProductOpen,
    }));
  };

  const handleSearchProduct = async (value: string) => {
    setOrderSelectDialog((pre) => ({ ...pre, myProduct: undefined }));

    const productsResponse = await productService.getProducts(DEFAULT_PAGINATION, value);
    if (!productsResponse.success || !productsResponse.data) {
      setOrderSelectDialog((pre) => ({ ...pre, myProduct: [] }));
      toast.error(productsResponse.message);

      return;
    }
    const productDataResponse = [...productsResponse.data];
    setOrderSelectDialog((pre) => ({ ...pre, myProduct: [...productDataResponse] }));
  };

  return (
    <Dialog open={open} onOpenChange={() => handleToggleDialog()}>
      <DialogTrigger asChild className="">
        <Button variant={'outline'}>
          <Filter /> Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-full max-w-full overflow-auto p-8 md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden">
          <Search
            placeholder="Product name"
            className="mb-2 mt-0"
            loading={myProduct === undefined}
            onSearch={handleSearchProduct}
          />
          <div className="max-h-[calc(70vh-80px)] overflow-y-auto overflow-x-hidden border-b border-[#e3e4e5]">
            {myProduct === undefined ? (
              <div className="flex min-h-[100px] w-full items-center justify-center">
                <span className="dsy-loading dsy-loading-spinner dsy-loading-lg"></span>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  {myProduct.length === 0 ? (
                    <div className="h-[100px] select-none text-center leading-[100px]">Product not found.</div>
                  ) : (
                    <>
                      {myProduct.map((productItem, index) => (
                        <div
                          key={`${productItem._id}-${index}`}
                          className={`mt-1 flex cursor-pointer items-center justify-between overflow-hidden rounded-[5px] border-b border-[#e3e4e5] p-2 pr-4`}
                          onClick={() => handleSelectProduct(productItem)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="group/orderProduct relative h-[96px] w-[96px] overflow-hidden rounded-[3px] border border-[#e3e4e5]">
                              <img
                                src={productItem.mainImage}
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
                                  USD {productItem.variants[0]?.price} <Dot className="h-4 w-4" />{' '}
                                  {productItem.variants[0]?.color} / {productItem.variants[0]?.size}
                                </p>
                              ) : (
                                <p className="flex">
                                  From USD {productItem.price} <Dot className="h-4 w-4" /> {productItem.variants.length}{' '}
                                  variants
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { OrderSelectProduct };
