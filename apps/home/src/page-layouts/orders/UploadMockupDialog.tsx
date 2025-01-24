import { AxiosError } from 'axios';
import { Newspaper, PlusCircle } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { CustomImageDto, ImageControlItem, ImageResponse } from 'shared';
import { getImageSize, ImageControlStatus, isValidImageFile, MARK_AS_PREVIEW_IMAGE, UploadFileType } from 'shared';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, ImageMockUpItem } from 'ui';

import { orderService, uploadImage } from '@/services';

import type { OrderDetailState } from './OrderDetail';

type Mockup = {
  mockup1?: CustomImageDto;
  mockup2?: CustomImageDto;
};

type UploadImage = keyof Mockup;

type UploadMockupDialogState = {
  isOpen: boolean;
  isUploading: boolean;
  mockupImage: Mockup;
  orderItemMockupsImage: ImageControlItem[];
  abortController?: AbortController;
};

type UploadMockupDialogProps = {
  lineItemId: string;
  mockup?: Mockup;
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

export type UploadMockUpDialogRef = {
  triggerOpenDialog: () => void;
};

const UploadMockupDialogDialog = forwardRef<UploadMockUpDialogRef, UploadMockupDialogProps>(
  ({ lineItemId, mockup, setOrderDetailState }, ref) => {
    const [uploadMockupDialogState, setUploadMockupDialogState] = useState<UploadMockupDialogState>({
      isOpen: false,
      isUploading: false,
      mockupImage: {},
      orderItemMockupsImage: [],
    });

    const deleteImageIdsRef = useRef<string[]>([]);

    useEffect(() => {
      const handleUploadOnPaste = (evt: ClipboardEvent) => {
        const clipboardItems = evt.clipboardData?.items;
        const items = [].slice.call(clipboardItems).filter((item: DataTransferItem) => {
          // Filter the image items only
          return /^image\//.test(item.type);
        });
        if (items.length === 0 || !items[0]) {
          return;
        }

        const item: DataTransferItem = items[0];
        const blob = item.getAsFile();

        if (!blob) {
          toast.error('Paste image failed');

          return;
        }

        if (uploadMockupDialogState.orderItemMockupsImage.length >= 2) {
          toast.error('Maximum 2 images uploaded');

          return;
        }

        const file = new File([blob], new Date().getTime().toString(), {
          type: 'image/jpeg',
          lastModified: new Date().getTime(),
        });
        const container = new DataTransfer();
        container.items.add(file);

        if (uploadMockupDialogState.orderItemMockupsImage.length === 0) {
          const pastedInputElement = document.querySelector('#upload-artwork-dialog-front') as HTMLInputElement;
          pastedInputElement.files = container.files;
          pastedInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (uploadMockupDialogState.orderItemMockupsImage.length === 1) {
          const pastedInputElement = document.querySelector('#upload-artwork-dialog-back') as HTMLInputElement;
          pastedInputElement.files = container.files;
          pastedInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      document.addEventListener('paste', handleUploadOnPaste);

      return () => {
        document.removeEventListener('paste', handleUploadOnPaste);
      };
    }, [uploadMockupDialogState.orderItemMockupsImage.length]);

    useEffect(() => {
      if (!mockup || !uploadMockupDialogState.isOpen) return;
      setUploadMockupDialogState((pre) => {
        const newMockUpImages: ImageControlItem[] = [];

        Object.keys(mockup).forEach((key) => {
          const value = mockup[key as keyof Mockup];
          if (value) {
            newMockUpImages.push({
              imageUrl: value.preview,
              imagePreviewUrl: '',
              isChecked: false,
              id: value._id,
              status: ImageControlStatus.Success,
            });
          }
        });

        return { ...pre, mockupImage: { ...mockup }, orderItemMockupsImage: newMockUpImages };
      });
    }, [mockup, uploadMockupDialogState.isOpen]);

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        setUploadMockupDialogState((pre) => ({ ...pre, isOpen: true }));
      },
    }));

    const handleRejectUpload = (imageId: string) => {
      setUploadMockupDialogState((pre) => ({
        ...pre,
        isUploading: false,
        abortController: undefined,
        orderItemMockupsImage: [...pre.orderItemMockupsImage].map((item) => {
          if (item.id === imageId) {
            return {
              ...item,
              status: ImageControlStatus.Rejected,
            };
          }

          return item;
        }),
      }));
    };

    const handleUpdateStateWhenSuccess = (imageId: string, imageResult: ImageResponse, type: UploadImage) => {
      setUploadMockupDialogState((pre) => ({
        ...pre,
        orderItemMockupsImage: [
          ...pre.orderItemMockupsImage.map((item) => {
            if (item.id !== imageId) return item;

            return {
              imageUrl: imageResult.data.preview,
              imagePreviewUrl: '',
              isChecked: false,
              id: imageResult.data._id,
              status: ImageControlStatus.Success,
            } as ImageControlItem;
          }),
        ],
        mockupImage: {
          mockup1:
            type === 'mockup1'
              ? { _id: imageResult.data._id, preview: imageResult.data.preview }
              : pre.mockupImage.mockup1,
          mockup2:
            type === 'mockup2'
              ? { _id: imageResult.data._id, preview: imageResult.data.preview }
              : pre.mockupImage.mockup2,
        },
        isUploading: false,
      }));
    };

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadImage) => {
      e.stopPropagation();
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];
      e.target.value = '';

      const isValidFile = await isValidImageFile(file, UploadFileType.Mockup);
      if (!isValidFile) {
        toast.error('File upload invalid');

        return;
      }

      const windowUrl = window.URL || window.webkitURL;
      const objectUrl = windowUrl.createObjectURL(file);
      const { width, height } = await getImageSize(objectUrl);

      if (width <= 800 || height <= 800) {
        toast.error('Mockup Image must be bigger than 800x800');

        return;
      }

      const tempImageId = `${MARK_AS_PREVIEW_IMAGE}_${type}_${new Date().getTime()}`;

      setUploadMockupDialogState((prev) => {
        const newMockupItem: ImageControlItem = {
          imageUrl: '',
          imagePreviewUrl: objectUrl,
          isChecked: false,
          id: tempImageId,
          status: ImageControlStatus.Pending,
          file,
        };

        const updatedDialogState: UploadMockupDialogState = {
          ...prev,
          orderItemMockupsImage:
            type === 'mockup1'
              ? [newMockupItem, ...prev.orderItemMockupsImage]
              : [...prev.orderItemMockupsImage, newMockupItem],
        };

        return updatedDialogState;
      });

      try {
        const newAbortController = new AbortController();
        setUploadMockupDialogState((pre) => ({ ...pre, abortController: newAbortController, isUploading: true }));
        const { signal } = newAbortController;
        const imageResult = await uploadImage(file, UploadFileType.Mockup, signal);

        if (!imageResult.success || !imageResult.data) {
          toast.error(imageResult.message);
          handleRejectUpload(tempImageId);
          e.target.value = '';

          return;
        }

        windowUrl.revokeObjectURL(objectUrl);

        // cancel upload request
        if (deleteImageIdsRef.current.includes(tempImageId)) {
          const index = deleteImageIdsRef.current.indexOf(tempImageId);
          if (index > -1) {
            deleteImageIdsRef.current.splice(index, 1);
          }

          return;
        }

        handleUpdateStateWhenSuccess(tempImageId, imageResult, type);
      } catch (error: any) {
        handleRejectUpload(tempImageId);

        if (error instanceof AxiosError) {
          if (error.response?.data.message) {
            toast.error(error.response?.data.message);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.error(error.message);
        }
      }
    };

    const handleDeleteImageItem = (id: string) => {
      if (uploadMockupDialogState.abortController) {
        uploadMockupDialogState.abortController.abort('Cancel API');
      }

      deleteImageIdsRef.current.push(id);
      setUploadMockupDialogState((pre) => ({
        ...pre,
        orderItemMockupsImage: pre.orderItemMockupsImage.filter((item) => item.id !== id),
        mockupImage: {
          ...pre.mockupImage,
          mockup1: pre.mockupImage.mockup1?._id === id ? { _id: '', preview: '' } : pre.mockupImage.mockup1,
          mockup2: pre.mockupImage.mockup2?._id === id ? { _id: '', preview: '' } : pre.mockupImage.mockup2,
        },
      }));
    };

    const handleReUpload = async (id: string) => {
      const imageItemUpload = uploadMockupDialogState.orderItemMockupsImage.find((item) => item.id === id);
      if (!imageItemUpload) return;
      const { file: uploadFile, imagePreviewUrl, type } = imageItemUpload;
      if (!uploadFile || !type) return;
      const windowUrl = window.URL || window.webkitURL;

      setUploadMockupDialogState((pre) => ({
        ...pre,
        orderItemMockupsImage: [...pre.orderItemMockupsImage].map((item) => {
          if (item.id === id)
            return {
              ...item,
              status: ImageControlStatus.ReUploadPending,
            };

          return item;
        }),
      }));

      try {
        const imageResult = await uploadImage(uploadFile, UploadFileType.Mockup);
        if (!imageResult.success || !imageResult.data) {
          toast.error(imageResult.message);
          handleRejectUpload(id);

          return;
        }

        windowUrl.revokeObjectURL(imagePreviewUrl);

        // cancel upload request
        if (deleteImageIdsRef.current.includes(id)) {
          const index = deleteImageIdsRef.current.indexOf(id);
          if (index > -1) {
            deleteImageIdsRef.current.splice(index, 1);
          }

          return;
        }

        handleUpdateStateWhenSuccess(id, imageResult, type as UploadImage);
      } catch (error: any) {
        handleRejectUpload(id);

        if (error instanceof AxiosError) {
          if (error.response?.data.message) {
            toast.error(error.response?.data.message);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.error(error.message);
        }
      }
    };

    const handleSubmitOrder = async (lineItemReUploads: UploadMockupDialogState) => {
      const { mockupImage } = lineItemReUploads;
      if (!mockupImage.mockup1?._id && !mockupImage.mockup2?._id) {
        toast.error('At least one mockup image to upload');

        return;
      }
      const updateReUploadLineItem = await orderService.updateReImageMockup(lineItemId, {
        mockup1: mockupImage.mockup1?._id,
        mockup2: mockupImage.mockup2?._id,
      });
      if (!updateReUploadLineItem.success || !updateReUploadLineItem.data) {
        toast.error(updateReUploadLineItem.message);

        return;
      }

      setOrderDetailState((pre) => ({
        ...pre,
        order: {
          ...pre.order,
          lineItems: pre.order.lineItems.map((item) => {
            if (item._id !== lineItemId) {
              return item;
            }

            return {
              ...item,
              mockup1: { _id: mockupImage.mockup1?._id || '', preview: mockupImage.mockup1?.preview || '' },
              mockup2: { _id: mockupImage.mockup2?._id || '', preview: mockupImage.mockup2?.preview || '' },
            };
          }),
        },
      }));
      setUploadMockupDialogState((pre) => ({ ...pre, isOpen: false }));
      toast.success('Update mockups successfully');
    };

    return (
      <Dialog
        open={uploadMockupDialogState.isOpen}
        onOpenChange={(value) => setUploadMockupDialogState((pre) => ({ ...pre, isOpen: value }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-4 flex w-full flex-1 flex-col gap-4">
              <div className="mb-2 mt-6 flex items-center gap-4">
                <Newspaper />
                <p className="text-base">Mockup</p>
              </div>
              <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex w-full items-center justify-around gap-4 py-[10px]">
                  {uploadMockupDialogState.orderItemMockupsImage.length > 0 ? (
                    uploadMockupDialogState.orderItemMockupsImage.map((item) => (
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
                        type={item.type}
                      />
                    ))
                  ) : (
                    <p className="text-center text-destructive">Mock up not found!</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-around">
                <label
                  className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-accent px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${uploadMockupDialogState.mockupImage?.mockup1?._id ||
                      uploadMockupDialogState.orderItemMockupsImage.some((item) =>
                        item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_mockup1`),
                      )
                      ? 'pointer-events-none cursor-default opacity-30'
                      : ''
                    }`}
                  htmlFor="upload-mockup-dialog-mockup1"
                >
                  <span className="hidden md:block">Upload Mockup1</span>
                  <span className="block md:hidden">
                    <PlusCircle />
                  </span>
                </label>
                <input
                  type="file"
                  id="upload-mockup-dialog-mockup1"
                  onChange={(e) => handleUploadImage(e, 'mockup1')}
                  hidden
                  accept="image/*"
                />

                <label
                  className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-primary px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${uploadMockupDialogState.mockupImage?.mockup2?._id ||
                      uploadMockupDialogState.orderItemMockupsImage.some((item) =>
                        item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_mockup2`),
                      )
                      ? 'pointer-events-none cursor-default opacity-30'
                      : ''
                    }`}
                  htmlFor="upload-mockup-dialog-mockup2"
                >
                  <span className="hidden md:block">Upload Mockup2</span>
                  <span className="block md:hidden">
                    <PlusCircle />
                  </span>
                </label>
                <input
                  type="file"
                  id="upload-mockup-dialog-mockup2"
                  onChange={(e) => handleUploadImage(e, 'mockup2')}
                  hidden
                  accept="image/*"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="flex items-center justify-end gap-2 rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
              onClick={() => {
                handleSubmitOrder(uploadMockupDialogState);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export { UploadMockupDialogDialog };
