import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { ImageControlItem, Product, ProductVariant } from 'shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Label,
  TebToastContainer,
  Textarea,
} from 'ui';

import { orderService, productService, productVariantService } from '@/services';

import OrderItem from './OrderItem';
import type { OrderShippingRef } from './OrderShipping';
import { OrderShipping, OrderShippingSchema } from './OrderShipping';
import type { SelectProductVariantDialogRef } from './SelectProductVariantDialog';
import { SelectProductVariantDialog } from './SelectProductVariantDialog';

type VariantDetail = {
  variantId: string;
  quantity: number;
};
type ChosenVariant = {
  identifier: string;
} & VariantDetail;

type Artwork = {
  front?: string;
  back?: string;
};

type Mockup = {
  mockup1?: string;
  mockup2?: string;
};

export type OrderState = {
  product: Product;
  variant: ChosenVariant;
  artworkImages: Artwork;
  mockupImages: Mockup;
  artworks: ImageControlItem[];
  mockups: ImageControlItem[];
  note?: string;
};

export type CreateOrderState = {
  isDialogDiscardOrderOpen: boolean;
  isPendingPublic: boolean;
  shippingInfo?: {};
  orders: OrderState[];
};

type ValidateExternalId = {
  isError: boolean;
  message: string;
};

const initCreateOrderState: CreateOrderState = {
  isDialogDiscardOrderOpen: false,
  isPendingPublic: false,
  orders: [],
};

const CreateOrder = () => {
  const [createOrderState, setCreateOrderState] = useState<CreateOrderState>(initCreateOrderState);
  const [externalId, setExternalId] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [designerName, setDesignerName] = useState<string>('');

  const [validateExternalId, setValidateExternalId] = useState<ValidateExternalId>({
    isError: false,
    message: '',
  });

  const shippingPriceRef = useRef(0);
  const orderShippingRef = useRef<OrderShippingRef>(null);
  const selectProductVariantsDialogRef = useRef<SelectProductVariantDialogRef>(null);

  const fetchProduct = useCallback(async (id: string): Promise<Product | undefined> => {
    const productResponse = await productService.getProduct(id);
    if (!productResponse.success || !productResponse.data) {
      toast.error(productResponse.message);

      return undefined;
    }

    return productResponse.data;
  }, []);

  const fetchProductVariant = useCallback(async (id: string): Promise<ProductVariant | undefined> => {
    const productVariantResponse = await productVariantService.getProductVariant(id);
    if (!productVariantResponse.success || !productVariantResponse.data) {
      toast.error(productVariantResponse.message);

      return undefined;
    }

    return productVariantResponse.data;
  }, []);

  const processOrderItem = async (productId: string, variantId: string) => {
    const [product, variant] = await Promise.all([fetchProduct(productId), fetchProductVariant(variantId)]);

    if (!product || !variant) {
      toast.error('Something went wrong!');

      return;
    }

    setCreateOrderState((pre) => ({
      ...pre,
      orders: [
        ...pre.orders,
        {
          product,
          variant: { identifier: new Date().getTime().toString(), variantId: variant._id, quantity: 1 },
          artworkImages: { front: '', back: '' },
          mockupImages: { mockup1: '', mockup2: '' },
          artworks: [],
          mockups: [],
        },
      ],
    }));
  };

  const subOrderTotal = useMemo(() => {
    let subTotal = 0;

    createOrderState.orders.forEach((orderItem) => {
      subTotal +=
        (orderItem.product.variants.find((productVariant) => productVariant._id === orderItem.variant.variantId)
          ?.price || 0) * orderItem.variant.quantity;
    });

    return subTotal.toFixed(2);
  }, [createOrderState.orders]);

  const handleSubmitOrder = (isFormValid: boolean, orders: OrderState[]) => {
    if (!isFormValid) {
      toast.warning('Validation shipping information fail!');

      return;
    }
    const authStorage = localStorage.getItem('auth-storage');
    const authData = authStorage ? JSON.parse(authStorage) : null;

    if (!authData && !authData.state && !authData.state.user && !authData.state.user.myStore) {
      toast.warning('Please have store first!');

      return;
    }

    const { storeCode } = authData?.state ?? {};
    const { email } = authData.state.user;
    const isTebprintEmail = /@tebprint\.com$/.test(email);

    let isOrderValid = true;

    if (orders.length === 0) {
      toast.warning('Please create at least one order item');

      return;
    }

    if (!externalId) {
      setValidateExternalId({ isError: true, message: 'External ID is required!' });
      toast.warning('Please fill all required fill!');

      return;
    }

    const orderShippingData = orderShippingRef.current?.getFormInfo().getValues();
    const parseOrderResult = OrderShippingSchema.safeParse(orderShippingData);

    const orderSubmit = orders.map((item) => {
      if (
        (!isTebprintEmail && item.artworkImages.front === '' && item.artworkImages.back === '') ||
        !item.variant.variantId
      ) {
        isOrderValid = false;
      }

      return {
        productId: item.product._id,
        variantId: item.variant.variantId,
        quantity: item.variant.quantity,
        frontArtwork: item.artworkImages.front,
        backArtwork: item.artworkImages.back,
        mockup1: item.mockupImages.mockup1,
        mockup2: item.mockupImages.mockup2,
        note: item.note,
      };
    });

    if (!parseOrderResult.success || !orderShippingData || !isOrderValid) {
      orderShippingRef.current?.fakeSubmit();
      toast.warning('Please fill all required fill!');

      return;
    }

    orderShippingRef.current?.getFormInfo().clearErrors();

    const createOrder = async () => {
      const createOrderResponse = await orderService.createOrder(
        externalId,
        orderNote,
        orderSubmit,
        orderShippingData,
        storeCode,
        designerName,
      );

      if (!createOrderResponse.success || !createOrderResponse.data) {
        toast.error(createOrderResponse.message);

        return;
      }

      toast.success('Create order successfully');
    };

    createOrder();
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (productId && variantId) {
      processOrderItem(productId, variantId);
    }
  }, []);

  return (
    <>
      <div className="w-full p-4">
        <div className="mx-auto my-10 w-full max-w-[1150px] bg-transparent px-4">
          <div className="mb-6">
            <div className="flex flex-col items-start justify-between md:flex-row">
              <a href="/orders" className="mb-4 flex items-center gap-1">
                <ArrowLeft />
                <span className="text-base">Back to My Orders </span>
              </a>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="flex items-center justify-center gap-2 text-base font-medium">
                      <Trash2 className="ml-2 h-4 w-4" /> <span>Discard</span>
                    </Button>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        window.location.href = '/orders';
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Discard anyway
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <h2 className="text-[1.75rem] font-bold leading-10 md:text-[2rem]">Create order</h2>
          </div>
          <div className="pb-4">
            <Label
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
            >
              External ID <span className="text-red-500"> *</span>
            </Label>
            <Input onChange={(e) => setExternalId(e.target.value)} value={externalId} placeholder="External ID" />
            {validateExternalId.isError && !externalId ? (
              <p id=":r0rm:-form-item-message" className="mt-2 text-sm font-medium text-red-500">
                {validateExternalId.message}
              </p>
            ) : (
              <></>
            )}
          </div>

          <div className="pb-4">
            <Label
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
            >
              Designer Name
            </Label>
            <Input onChange={(e) => setDesignerName(e.target.value)} value={designerName} placeholder="Designer Name" />
          </div>

          <div className="pb-4">
            <Label
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
            >
              Note
            </Label>
            <Textarea
              className="border-0 bg-white"
              onChange={(e) => setOrderNote(e.target.value)}
              value={orderNote}
              placeholder="Note"
            />
          </div>

          <div className="mb-6">
            {createOrderState.orders.map((productItem) => (
              <OrderItem
                order={productItem}
                key={productItem.variant.identifier}
                setCreateOrderState={setCreateOrderState}
              />
            ))}

            {createOrderState.orders.length > 0 && (
              <div className="mt-6 flex w-full items-center justify-between">
                <button
                  className="flex h-12 cursor-pointer items-center justify-between gap-5 border border-dashed border-[#c4c7c8] bg-background px-[23px] py-[11px] font-medium"
                  onClick={() => selectProductVariantsDialogRef.current?.triggerOpenDialog()}
                >
                  <div className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add new order item (product)</span>
                  </div>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <p className="font-medium">Subtotal</p>
                  <p>${subOrderTotal}</p>
                </div>
              </div>
            )}

            {createOrderState.orders.length === 0 && (
              <button
                className="flex h-12 cursor-pointer items-center justify-between gap-5 border border-dashed border-[#c4c7c8] bg-background px-[23px] py-[11px] font-medium"
                onClick={() => selectProductVariantsDialogRef.current?.triggerOpenDialog()}
              >
                <div className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Add new order item (product)</span>
                </div>
              </button>
            )}
          </div>

          <div className="mb-6">
            <OrderShipping ref={orderShippingRef} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-6">
            <p className="font-medium">Total</p>
            <p>
              ${(shippingPriceRef.current + +subOrderTotal).toFixed(2)} (Shipping: $
              {shippingPriceRef.current.toFixed(2)})
            </p>
            <Button onClick={() => handleSubmitOrder(true, createOrderState.orders)}>Submit</Button>
          </div>
        </div>
      </div>

      <SelectProductVariantDialog setCreateOrderState={setCreateOrderState} ref={selectProductVariantsDialogRef} />

      <TebToastContainer />
    </>
  );
};

export { CreateOrder };
