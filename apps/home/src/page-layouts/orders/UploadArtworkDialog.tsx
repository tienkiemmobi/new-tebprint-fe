import { AxiosError } from 'axios';
import { Newspaper, PlusCircle } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { CustomImageDto, ImageControlItem, ImageResponse } from 'shared';
import { getImageSize, ImageControlStatus, isValidImageFile, MARK_AS_PREVIEW_IMAGE, UploadFileType } from 'shared';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, ImageMockUpItem } from 'ui';

import { orderService, uploadImage } from '@/services';

import type { OrderDetailState } from './OrderDetail';

type Artwork = {
  front?: CustomImageDto;
  back?: CustomImageDto;
};

type UploadImage = keyof Artwork;

type UploadArtworkDialogState = {
  isOpen: boolean;
  isUploading: boolean;
  artworkImage: Artwork;
  orderItemArtworksImage: ImageControlItem[];
  abortController?: AbortController;
};

type UploadArtworkDialogProps = {
  lineItemId: string;
  status: string;
  artwork?: Artwork;
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

export type UploadArtworkDialogRef = {
  triggerOpenDialog: () => void;
};

const UploadArtworkDialogDialog = forwardRef<UploadArtworkDialogRef, UploadArtworkDialogProps>(
  ({ status, lineItemId, artwork, setOrderDetailState }, ref) => {
    console.log('🚀 ~ lineItemId:', lineItemId);
    const [uploadArtworkDialogState, setUploadArtworkDialogState] = useState<UploadArtworkDialogState>({
      isOpen: false,
      isUploading: false,
      artworkImage: {},
      orderItemArtworksImage: [],
    });

    const deleteImageIdsRef = useRef<string[]>([]);

    useEffect(() => {
      if (!artwork || !uploadArtworkDialogState.isOpen) return;
      setUploadArtworkDialogState((pre) => {
        const newArtworkImages: ImageControlItem[] = [];

        Object.keys(artwork).forEach((key) => {
          const value = artwork[key as keyof Artwork];
          if (value) {
            newArtworkImages.push({
              imageUrl: value.preview,
              imagePreviewUrl: '',
              isChecked: false,
              id: value.preview,
              status: ImageControlStatus.Success,
            });
          }
        });

        return { ...pre, artworkImage: { ...artwork }, orderItemArtworksImage: newArtworkImages };
      });
    }, [artwork, uploadArtworkDialogState.isOpen]);

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        setUploadArtworkDialogState((pre) => ({ ...pre, isOpen: true }));
      },
    }));

    const handleRejectUpload = (imageId: string) => {
      setUploadArtworkDialogState((pre) => ({
        ...pre,
        isUploading: false,
        abortController: undefined,
        orderItemArtworksImage: [...pre.orderItemArtworksImage].map((item) => {
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
      setUploadArtworkDialogState((pre) => ({
        ...pre,
        orderItemArtworksImage: [
          ...pre.orderItemArtworksImage.map((item) => {
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
        artworkImage: {
          front:
            type === 'front'
              ? { _id: imageResult.data._id, preview: imageResult.data.preview }
              : pre.artworkImage.front,
          back:
            type === 'back' ? { _id: imageResult.data._id, preview: imageResult.data.preview } : pre.artworkImage.back,
        },
        isUploading: false,
      }));
    };

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadImage) => {
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];
      e.target.value = '';

      const isValidFile = await isValidImageFile(file, UploadFileType.Artwork);
      if (!isValidFile) {
        toast.error('File upload invalid');

        return;
      }

      const windowUrl = window.URL || window.webkitURL;
      const objectUrl = windowUrl.createObjectURL(file);
      const { width, height } = await getImageSize(objectUrl);

      if (width <= 300 || height <= 300) {
        toast.error('Artwork Image must be bigger than 300x300');

        return;
      }

      const tempImageId = `${MARK_AS_PREVIEW_IMAGE}_${type}_${new Date().getTime()}`;

      setUploadArtworkDialogState((prev) => {
        const newArtworkItem: ImageControlItem = {
          imageUrl: '',
          imagePreviewUrl: objectUrl,
          isChecked: false,
          id: tempImageId,
          status: ImageControlStatus.Pending,
          file,
        };

        const updatedDialogState: UploadArtworkDialogState = {
          ...prev,
          orderItemArtworksImage:
            type === 'front'
              ? [newArtworkItem, ...prev.orderItemArtworksImage]
              : [...prev.orderItemArtworksImage, newArtworkItem],
        };

        return updatedDialogState;
      });

      try {
        const newAbortController = new AbortController();
        setUploadArtworkDialogState((pre) => ({ ...pre, abortController: newAbortController, isUploading: true }));
        const { signal } = newAbortController;
        const imageResult = await uploadImage(file, UploadFileType.Artwork, signal);

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
    };

    const handleDeleteImageItem = (id: string) => {
      if (uploadArtworkDialogState.abortController) {
        uploadArtworkDialogState.abortController.abort('Cancel API');
      }

      deleteImageIdsRef.current.push(id);
      setUploadArtworkDialogState((pre) => ({
        ...pre,
        orderItemArtworksImage: pre.orderItemArtworksImage.filter((item) => item.id !== id),
        artworkImage: {
          ...pre.artworkImage,
          front: pre.artworkImage.front?._id === id ? { _id: '', preview: '' } : pre.artworkImage.front,
          back: pre.artworkImage.back?._id === id ? { _id: '', preview: '' } : pre.artworkImage.back,
        },
      }));
    };

    const handleReUpload = async (id: string) => {
      const imageItemUpload = uploadArtworkDialogState.orderItemArtworksImage.find((item) => item.id === id);
      if (!imageItemUpload) return;
      const { file: uploadFile, imagePreviewUrl, type } = imageItemUpload;
      if (!uploadFile) return;
      const windowUrl = window.URL || window.webkitURL;

      setUploadArtworkDialogState((pre) => ({
        ...pre,
        orderItemArtworksImage: [...pre.orderItemArtworksImage].map((item) => {
          if (item.id === id)
            return {
              ...item,
              status: ImageControlStatus.ReUploadPending,
            };

          return item;
        }),
      }));

      try {
        const imageResult = await uploadImage(uploadFile, UploadFileType.Artwork);
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
        if (error instanceof AxiosError) {
          if (error.response?.data.message) {
            toast.error(error.response?.data.message);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.error(error.message);
        }

        handleRejectUpload(id);
      }
    };

    const handleSubmitOrder = async (lineItemReUploads: UploadArtworkDialogState) => {
      const { artworkImage } = lineItemReUploads;
      const artworkImagePayload = {
        frontArtwork: artworkImage.front?._id || '',
        backArtwork: artworkImage.back?._id || '',
      };

      if (!artworkImagePayload.frontArtwork && !artworkImagePayload.backArtwork) {
        toast.error('At least one artwork image to upload');

        return;
      }

      const typePayload = status === 'no_artwork' ? 'update-artwork' : 'error-artwork';

      const updateReUploadLineItem = await orderService.updateReImageArtwork(
        lineItemId,
        artworkImagePayload,
        typePayload,
      );
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

            return { ...item, front: artworkImage.front || '', back: artworkImage.back || '' };
          }),
        },
      }));
      toast.success('Update artworks successfully');
    };

    return (
      <Dialog
        open={uploadArtworkDialogState.isOpen}
        onOpenChange={(value) => setUploadArtworkDialogState((pre) => ({ ...pre, isOpen: value }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-4 flex w-full flex-1 flex-col gap-4">
              <div className="mb-2 mt-6 flex items-center gap-4">
                <Newspaper />
                <p className="text-base">Artwork</p>
              </div>
              <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex w-full items-center justify-around gap-4 py-[10px]">
                  {uploadArtworkDialogState.orderItemArtworksImage.length > 0 ? (
                    uploadArtworkDialogState.orderItemArtworksImage.map((item) => (
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
                    <p className="text-center text-destructive">At lease one artwork is required!</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-around">
                <label
                  className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-accent px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                    uploadArtworkDialogState.artworkImage?.front?._id ||
                    uploadArtworkDialogState.orderItemArtworksImage.some((item) =>
                      item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_front`),
                    )
                      ? 'pointer-events-none cursor-default opacity-30'
                      : ''
                  }`}
                  htmlFor="upload-artwork-dialog-front"
                >
                  <span className="hidden md:block">Upload Front Artwork</span>
                  <span className="block md:hidden">
                    <PlusCircle />
                  </span>
                </label>
                <input
                  type="file"
                  id="upload-artwork-dialog-front"
                  onChange={(e) => handleUploadImage(e, 'front')}
                  hidden
                  accept="image/png,image/webp,image/jpeg,image/jpg"
                />

                <label
                  className={`flex max-w-[300px] cursor-pointer items-center justify-center rounded-[3px] bg-primary px-4 py-2 text-[14px] font-semibold hover:opacity-90 ${
                    uploadArtworkDialogState.artworkImage?.back?._id ||
                    uploadArtworkDialogState.orderItemArtworksImage.some((item) =>
                      item.id.includes(`${MARK_AS_PREVIEW_IMAGE}_back`),
                    )
                      ? 'pointer-events-none cursor-default opacity-30'
                      : ''
                  }`}
                  htmlFor="upload-artwork-dialog-back"
                >
                  <span className="hidden md:block">Upload Back Artwork</span>
                  <span className="block md:hidden">
                    <PlusCircle />
                  </span>
                </label>
                <input
                  type="file"
                  id="upload-artwork-dialog-back"
                  onChange={(e) => handleUploadImage(e, 'back')}
                  hidden
                  accept="image/png,image/webp,image/jpeg,image/jpg"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger
              className="flex items-center justify-end gap-2"
              onClick={() => {
                handleSubmitOrder(uploadArtworkDialogState);
              }}
            >
              <div className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600">Save changes</div>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

export { UploadArtworkDialogDialog };
