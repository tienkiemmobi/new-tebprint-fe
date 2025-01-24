import { AxiosError } from 'axios';
import { ChevronDown, ChevronUp, Copy, Newspaper, PlusCircle, SearchCode, ShoppingCart, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import type { ImageControlItem, ProductVariant } from 'shared';
import {
  getImageSize,
  ImageControlStatus,
  ImageControlType,
  isValidImageFile,
  MARK_AS_PREVIEW_IMAGE,
  UploadFileType,
} from 'shared';
import { CustomDropdown, ImageMockUpItem, Input, Textarea } from 'ui';

import { SelectVariant } from '@/components';
import { uploadImage } from '@/services';

import type { CreateOrderState, OrderState } from '.';

type OrderItemProps = {
  order: OrderState;
  setCreateOrderState: React.Dispatch<React.SetStateAction<CreateOrderState>>;
};

// type OrderItemState = {
//   variantId?: string;
// };

const OrderItem = ({ order, setCreateOrderState }: OrderItemProps) => {
  // const [orderItemState, setOrderItemState] = useState<OrderItemState>({});

  const deleteImageIdRef = useRef('');

  const handleDuplicateProductOrder = (identifier: string) => {
    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === identifier);

      if (orderIndex === -1) return pre;
      const orderTmp: OrderState = pre.orders[orderIndex]!;

      const newOrder: OrderState = {
        ...orderTmp,
        variant: {
          ...orderTmp.variant,
          identifier: new Date().getTime().toString(),
        },
      };

      return {
        ...pre,
        orders: [...pre.orders, newOrder],
      };
    });
  };

  const handleRemoveProductOrder = (productId: string) => {
    setCreateOrderState((pre) => ({
      ...pre,
      orders: pre.orders.filter(
        (item) => item.product._id !== productId || item.variant.identifier !== order.variant.identifier,
      ),
    }));
  };

  const findVariantItemByVariantId = (variants: ProductVariant[], variantId: string) => {
    return variants.find((v) => v._id === variantId);
  };

  const handlePreventNoInteger = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/\D+/g, ''); // Lọc ra chỉ các chữ số
    event.target.value = newValue;
  };

  const processVariantId = (variantId: string) => {
    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);
      if (orderIndex === -1) return pre;

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
      };

      if (!variantId) {
        updatedOrder.variant = {
          ...pre.orders[orderIndex]!.variant,
          variantId: '',
          quantity: 0,
        };
      } else {
        const orderExisted = pre.orders.some((item) => item.variant.variantId === variantId);

        if (orderExisted) {
          toast.error('This variant you already added to the order');

          return pre;
        }

        updatedOrder.variant = {
          ...order.variant,
          variantId,
        };
      }

      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });
  };

  const handleVariantQuantityChange = (value: number) => {
    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

      if (orderIndex === -1) {
        return pre;
      }

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
        variant: {
          ...pre.orders[orderIndex]!.variant,
          quantity: value,
        },
      };

      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });
  };

  const handleNoteChange = (value: string) => {
    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

      if (orderIndex === -1) {
        return pre;
      }

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
        note: value,
      };
      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });
  };

  const handleRejectUpload = (imageId: string) => {
    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

      if (orderIndex === -1) return pre;

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
        artworks: pre.orders[orderIndex]!.artworks.map((item) => {
          if (item.id === imageId)
            return {
              ...item,
              status: ImageControlStatus.Rejected,
            };

          return item;
        }),
        mockups: pre.orders[orderIndex]!.mockups.map((item) => {
          if (item.id === imageId)
            return {
              ...item,
              status: ImageControlStatus.Rejected,
            };

          return item;
        }),
      };
      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });
  };

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>, type: ImageControlType) => {
    if (!e.target.files || !e.target.files[0]) return;

    const isValidFile = await isValidImageFile(
      e.target.files[0],
      type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2
        ? UploadFileType.Mockup
        : UploadFileType.Artwork,
    );
    if (!isValidFile) {
      toast.error('File upload invalid');

      return;
    }

    const windowUrl = window.URL || window.webkitURL;
    const objectUrl = windowUrl.createObjectURL(e.target.files[0]);
    const { width, height } = await getImageSize(objectUrl);

    if ((type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2) && (width <= 800 || height <= 800)) {
      toast.error('Mockup Image must be bigger than 800x800');

      return;
    }

    if ((type === 'front' || type === 'back') && (width <= 1000 || height <= 1000)) {
      toast.error('Artworks Image must be bigger than 1000x1000');

      return;
    }

    const file = e.target.files[0];
    const tempImageId = `${MARK_AS_PREVIEW_IMAGE}_${type}_${new Date().getTime()}`;

    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

      if (orderIndex === -1) return pre;

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
      };

      if (type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2) {
        updatedOrder.mockups = [
          ...pre.orders[orderIndex]!.mockups,
          {
            imageUrl: '',
            imagePreviewUrl: objectUrl,
            isChecked: false,
            id: tempImageId,
            status: ImageControlStatus.Pending,
            file,
            type,
          },
        ];
      } else {
        updatedOrder.artworks = [...pre.orders[orderIndex]!.artworks];
        const newArtworkItem: ImageControlItem = {
          imageUrl: '',
          imagePreviewUrl: objectUrl,
          isChecked: false,
          id: tempImageId,
          status: ImageControlStatus.Pending,
          file,
          type,
        };
        if (type === 'front') updatedOrder.artworks.unshift(newArtworkItem);
        if (type === 'back') updatedOrder.artworks.push(newArtworkItem);
      }

      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });

    try {
      const imageResult = await uploadImage(
        file,
        type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2
          ? UploadFileType.Mockup
          : UploadFileType.Artwork,
      );
      if (!imageResult.success || !imageResult.data) {
        toast.error(imageResult.message);
        handleRejectUpload(tempImageId);

        return;
      }

      windowUrl.revokeObjectURL(objectUrl);

      // Cancel when delete item image
      if (deleteImageIdRef.current !== tempImageId)
        setCreateOrderState((pre) => {
          const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

          if (orderIndex === -1) return pre;

          const updatedOrder: OrderState = {
            ...pre.orders[orderIndex]!,
          };

          if (type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2) {
            updatedOrder.mockupImages = {
              mockup1:
                type === ImageControlType.Mockup1 ? imageResult.data._id : pre.orders[orderIndex]!.mockupImages.mockup1,
              mockup2:
                type === ImageControlType.Mockup2 ? imageResult.data._id : pre.orders[orderIndex]!.mockupImages.mockup2,
            };
            updatedOrder.mockups = [
              ...pre.orders[orderIndex]!.mockups.map((item) => {
                if (item.id !== tempImageId) return item;

                return {
                  imageUrl: imageResult.data.preview,
                  imagePreviewUrl: '',
                  isChecked: false,
                  id: imageResult.data._id,
                  status: ImageControlStatus.Success,
                  type,
                } as ImageControlItem;
              }),
            ];
          } else {
            updatedOrder.artworkImages = {
              front: type === 'front' ? imageResult.data._id : pre.orders[orderIndex]!.artworkImages.front,
              back: type === 'back' ? imageResult.data._id : pre.orders[orderIndex]!.artworkImages.back,
            };

            updatedOrder.artworks = [
              ...pre.orders[orderIndex]!.artworks.map((item) => {
                if (item.id !== tempImageId) return item;

                return {
                  imageUrl: imageResult.data.preview,
                  imagePreviewUrl: '',
                  isChecked: false,
                  id: imageResult.data._id,
                  status: ImageControlStatus.Success,
                  type,
                } as ImageControlItem;
              }),
            ];
          }

          const updatedOrderList = [
            ...pre.orders.slice(0, orderIndex),
            updatedOrder,
            ...pre.orders.slice(orderIndex + 1),
          ];

          return {
            ...pre,
            orders: updatedOrderList,
            isImageUploading: false,
          };
        });
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response?.data.message) {
          toast.error(error.response?.data.message);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message);
      }

      handleRejectUpload(tempImageId);
    }

    e.target.value = '';
  };

  const handleDeleteImageItem = (imageId: string) => {
    deleteImageIdRef.current = imageId;

    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);

      if (orderIndex === -1) return pre;

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
        artworks: pre.orders[orderIndex]!.artworks.filter((item) => item.id !== imageId),
        artworkImages: {
          front:
            pre.orders[orderIndex]!.artworkImages.front === imageId ? '' : pre.orders[orderIndex]!.artworkImages.front,
          back:
            pre.orders[orderIndex]!.artworkImages.back === imageId ? '' : pre.orders[orderIndex]!.artworkImages.back,
        },
        mockups: pre.orders[orderIndex]!.mockups.filter((item) => item.id !== imageId),
        mockupImages: {
          mockup1:
            pre.orders[orderIndex]!.mockupImages.mockup1 === imageId
              ? ''
              : pre.orders[orderIndex]!.mockupImages.mockup1,
          mockup2:
            pre.orders[orderIndex]!.mockupImages.mockup2 === imageId
              ? ''
              : pre.orders[orderIndex]!.mockupImages.mockup2,
        },
      };
      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });
  };

  const handleReUpload = async (imageId: string, type?: ImageControlType) => {
    let uploadFile;
    let imagePreviewUrl = '';

    setCreateOrderState((pre) => {
      const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);
      if (orderIndex === -1) return pre;

      const imageItemUpload = [...pre.orders[orderIndex]!.artworks, ...pre.orders[orderIndex]!.mockups].find(
        (item) => item.id === imageId,
      );
      if (!imageItemUpload) return pre;

      uploadFile = imageItemUpload.file;
      imagePreviewUrl = imageItemUpload.imagePreviewUrl;

      if (!uploadFile || !type) {
        toast.error('Some thing wrong');

        return pre;
      }

      const updatedOrder: OrderState = {
        ...pre.orders[orderIndex]!,
      };

      if (type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2) {
        updatedOrder.mockups = updatedOrder.mockups.map((item) => {
          if (item.id === imageId)
            return {
              ...item,
              status: ImageControlStatus.ReUploadPending,
            };

          return item;
        });
      } else {
        updatedOrder.artworks = updatedOrder.artworks.map((item) => {
          if (item.id === imageId)
            return {
              ...item,
              status: ImageControlStatus.ReUploadPending,
            };

          return item;
        });
      }

      const updatedOrderList = [...pre.orders.slice(0, orderIndex), updatedOrder, ...pre.orders.slice(orderIndex + 1)];

      return {
        ...pre,
        orders: updatedOrderList,
      };
    });

    if (!uploadFile) {
      handleRejectUpload(imageId);

      return;
    }

    try {
      const imageResult = await uploadImage(
        uploadFile as File,
        type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2
          ? UploadFileType.Mockup
          : UploadFileType.Artwork,
      );
      if (!imageResult.success || !imageResult.data) {
        toast.error(imageResult.message);
        handleRejectUpload(imageId);

        return;
      }

      const windowUrl = window.URL || window.webkitURL;
      windowUrl.revokeObjectURL(imagePreviewUrl);

      // Cancel when delete item image
      if (deleteImageIdRef.current !== imageId)
        setCreateOrderState((pre) => {
          const orderIndex = pre.orders.findIndex((item) => item.variant.identifier === order.variant.identifier);
          if (orderIndex === -1) return pre;

          const updatedOrder: OrderState = {
            ...pre.orders[orderIndex]!,
          };

          if (type === ImageControlType.Mockup1 || type === ImageControlType.Mockup2) {
            updatedOrder.mockupImages = {
              mockup1:
                type === ImageControlType.Mockup1 ? imageResult.data._id : pre.orders[orderIndex]!.mockupImages.mockup1,
              mockup2:
                type === ImageControlType.Mockup2 ? imageResult.data._id : pre.orders[orderIndex]!.mockupImages.mockup2,
            };
            updatedOrder.mockups = [
              ...pre.orders[orderIndex]!.mockups.map((item) => {
                if (item.id !== imageId) return item;

                return {
                  imageUrl: imageResult.data.preview,
                  imagePreviewUrl: '',
                  isChecked: false,
                  id: imageResult.data._id,
                  status: ImageControlStatus.Success,
                  type,
                } as ImageControlItem;
              }),
            ];
          } else {
            updatedOrder.artworkImages = {
              front: type === 'front' ? imageResult.data._id : pre.orders[orderIndex]!.artworkImages.front,
              back: type === 'back' ? imageResult.data._id : pre.orders[orderIndex]!.artworkImages.back,
            };
            updatedOrder.artworks = [
              ...pre.orders[orderIndex]!.artworks.map((item) => {
                if (item.id !== imageId) return item;

                return {
                  imageUrl: imageResult.data.preview,
                  imagePreviewUrl: '',
                  isChecked: false,
                  id: imageResult.data._id,
                  status: ImageControlStatus.Success,
                  type,
                } as ImageControlItem;
              }),
            ];
          }

          const updatedOrderList = [
            ...pre.orders.slice(0, orderIndex),
            updatedOrder,
            ...pre.orders.slice(orderIndex + 1),
          ];

          return {
            ...pre,
            orders: updatedOrderList,
            isImageUploading: false,
          };
        });
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response?.data.message) {
          toast.error(error.response?.data.message);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message);
      }

      handleRejectUpload(imageId);
    }
  };

  return (
    <div className="mt-6 w-full rounded-[3px] border border-[#e3e4e5] bg-background">
      <CustomDropdown
        title={order.product.title}
        labelStyle="w-full flex justify-between items-center px-6 py-4 border-b border-[#e3e4e5]"
        textStyle="text-xl font-bold"
        rightIcon={<ChevronUp />}
        rightToggleIcon={<ChevronDown />}
        isDropDownOpen={true}
        dropDownContent={
          <>
            <div className="border-b border-[#e3e4e5] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShoppingCart />
                  <p className="text-base">Product selected</p>
                </div>
                <div className="flex items-center gap-4">
                  <Copy
                    className="cursor-pointer text-[#595959] hover:text-[#29ab51] hover:before:shadow-icon-hover"
                    onClick={() => handleDuplicateProductOrder(order.variant.identifier)}
                  />
                  <Trash2
                    className="cursor-pointer text-[#595959] hover:text-[#29ab51]"
                    onClick={() => handleRemoveProductOrder(order.product._id)}
                  />
                </div>
              </div>

              <div className="mb-4 flex gap-8">
                <div className="group/productSelect relative h-[96px] w-[96px] cursor-pointer overflow-hidden rounded-[3px] border border-[#e3e4e5]">
                  <img
                    src={order.product.mainImage.preview}
                    alt=""
                    width={168}
                    height={168}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="invisible absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center border border-[#c4c7c8] bg-background transition-all group-hover/productSelect:visible">
                    <SearchCode />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-bold">
                    {findVariantItemByVariantId(order.product.variants, order.variant.variantId)?.name || <i>None</i>} -{' '}
                    {findVariantItemByVariantId(order.product.variants, order.variant.variantId)?.code || <i>None</i>}
                  </p>
                  <p className="h-6 w-fit border border-[#686f71] bg-[#f7f7f7] px-2 py-[2px] text-center text-sm">
                    {order.product.title} (TebPrint)
                  </p>

                  <div className="w-[300px]">
                    <SelectVariant
                      variants={order.product.variants}
                      processVariantId={processVariantId}
                      variantId={order.variant.variantId}
                    />
                  </div>
                  <div>
                    <Textarea placeholder="Note" onChange={(e) => handleNoteChange(e.target.value)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <p>Production costs</p>
                    <div className="flex items-center gap-2">
                      <p>${findVariantItemByVariantId(order.product.variants, order.variant.variantId)?.price}</p>
                      <p>x</p>
                      <div>
                        <Input
                          type="number"
                          className="w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={String(order.variant.quantity)}
                          onChange={(e) => handleVariantQuantityChange(+e.target.value)}
                          min="0"
                          step="1"
                          onInput={handlePreventNoInteger}
                        />
                      </div>
                    </div>
                    <p>
                      $
                      {(
                        (findVariantItemByVariantId(order.product.variants, order.variant.variantId)?.price || 0) *
                        order.variant.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <hr />

              <div className="mb-4 flex w-full flex-1 flex-col gap-4">
                <div className="mb-2 mt-6 flex items-center gap-4">
                  <Newspaper />
                  <p className="text-base">Artworks</p>
                </div>
                <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="flex w-full items-center justify-around gap-4 py-[10px]">
                    {/* List Image */}
                    {order.artworks.length > 0 ? (
                      order.artworks.map((item, index) => (
                        <ImageMockUpItem
                          key={`${item.id}-${index}`}
                          imageUrl={item.imageUrl}
                          isChecked={item.isChecked}
                          id={item.id}
                          handleDeleteItem={handleDeleteImageItem}
                          imagePreviewUrl={item.imagePreviewUrl}
                          handleReUpload={handleReUpload}
                          status={item.status}
                          imageStyles="w-[200px] h-[200px] rounded-[6px]"
                          closeStyle="w-8 h-8 !block text-destructive"
                          type={item.type}
                        />
                      ))
                    ) : (
                      <p className="text-center text-destructive">At lease one artwork </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-around">
                  <label
                    className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-accent px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                      order.artworkImages.front ||
                      order.artworks.some((item) => item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_front`))
                        ? 'pointer-events-none cursor-default opacity-30'
                        : ''
                    }`}
                    htmlFor={`input-${order.variant.identifier}-front`}
                  >
                    <span className="hidden md:block">Upload Front Artwork</span>
                    <span className="block md:hidden">
                      <PlusCircle />
                    </span>
                  </label>
                  <input
                    type="file"
                    id={`input-${order.variant.identifier}-front`}
                    hidden
                    onChange={(e) => handleUploadImage(e, ImageControlType.Front)}
                    accept="image/png"
                    data-upload-front
                  />

                  <label
                    className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-primary px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                      order.artworkImages.back ||
                      order.artworks.some((item) => item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_back`))
                        ? 'pointer-events-none cursor-default opacity-30'
                        : ''
                    }`}
                    htmlFor={`input-${order.variant.identifier}-back`}
                  >
                    <span className="hidden md:block">Upload Back Artwork</span>
                    <span className="block md:hidden">
                      <PlusCircle />
                    </span>
                  </label>
                  <input
                    type="file"
                    id={`input-${order.variant.identifier}-back`}
                    hidden
                    onChange={(e) => handleUploadImage(e, ImageControlType.Back)}
                    accept="image/png"
                  />
                </div>
              </div>

              <hr />

              <div className="flex w-full flex-1 flex-col gap-4">
                <div className="mb-2 mt-6 flex items-center gap-4">
                  <Newspaper />
                  <p className="text-base">Mockups</p>
                </div>
                <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="flex w-full items-center justify-around gap-4 py-[10px]">
                    {/* List Image */}
                    {order.mockups.length > 0 ? (
                      order.mockups.map((item) => (
                        <ImageMockUpItem
                          key={item.id}
                          imageUrl={item.imageUrl}
                          isChecked={item.isChecked}
                          id={item.id}
                          handleDeleteItem={handleDeleteImageItem}
                          imagePreviewUrl={item.imagePreviewUrl}
                          handleReUpload={handleReUpload}
                          status={item.status}
                          imageStyles="w-[200px] h-[200px] rounded-[6px]"
                          closeStyle="w-8 h-8 !block text-destructive"
                        />
                      ))
                    ) : (
                      <p className="text-center">You should upload some mockups</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-around">
                  <label
                    className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-accent px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                      order.mockupImages.mockup1 ||
                      order.mockups.some((item) => item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_mockup1`))
                        ? 'pointer-events-none cursor-default opacity-30'
                        : ''
                    }`}
                    htmlFor={`input-${order.variant.identifier}-mockup1`}
                  >
                    <span className="hidden md:block">Upload Mockup1</span>
                    <span className="block md:hidden">
                      <PlusCircle />
                    </span>
                  </label>
                  <input
                    type="file"
                    id={`input-${order.variant.identifier}-mockup1`}
                    hidden
                    onChange={(e) => handleUploadImage(e, ImageControlType.Mockup1)}
                    accept="image/png"
                  />
                  <label
                    className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-primary px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                      order.mockupImages.mockup2 ||
                      order.mockups.some((item) => item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_mockup2`))
                        ? 'pointer-events-none cursor-default opacity-30'
                        : ''
                    }`}
                    htmlFor={`input-${order.variant.identifier}-mockup2`}
                  >
                    <span className="hidden md:block">Upload Mockup2</span>
                    <span className="block md:hidden">
                      <PlusCircle />
                    </span>
                  </label>
                  <input
                    type="file"
                    id={`input-${order.variant.identifier}-mockup2`}
                    hidden
                    onChange={(e) => handleUploadImage(e, ImageControlType.Mockup2)}
                    accept="image/png"
                  />
                </div>
              </div>
            </div>
          </>
        }
      />
    </div>
  );
};

export default OrderItem;
