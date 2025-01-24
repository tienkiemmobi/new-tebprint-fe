import 'react-toastify/dist/ReactToastify.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { ArrowLeft, Bookmark, PlusCircle } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { Category, CustomImageDto, ImageControlItem, Product } from 'shared';
import { getImageSize, ImageControlStatus, MARK_AS_PREVIEW_IMAGE, UploadFileType } from 'shared';
import {
  AreaLayout,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ImageMockUpItem,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TebToastContainer,
  Textarea,
} from 'ui';
import { ZodError } from 'zod';

import type { NewProductDto, NewProductPayLoadDto, NewProductVariantDto } from '@/interfaces';
import { NewProductVariantsZodSchema, NewProductZodSchema } from '@/interfaces';
import { productService, uploadImage } from '@/services';
import { categoryService } from '@/services/category';

import { EditProductTable } from './EditProductTable';

const CREATE_PRODUCT_PARAM = 'new';

type EditProductProps = {
  paramId?: string;
};

export type EditProductState = {
  isImageUploading: boolean;
  isPendingPublic: boolean;
  imageList: ImageControlItem[];
  variants: NewProductVariantDto[];
  productDetail: {
    mainImageId: string;
    otherImageIds: string[];
  };
  productInfo?: Product;
  propertyOrder: string[];
};

const initEditProductLayoutState: EditProductState = {
  isImageUploading: false,
  isPendingPublic: false,
  imageList: [],
  variants: [],
  productDetail: {
    mainImageId: '',
    otherImageIds: [],
  },
  propertyOrder: ['size', 'color', 'style'],
};

let initialVariants: NewProductVariantDto[] = [];

const EditProduct = ({ paramId = '' }: EditProductProps) => {
  console.log(paramId);
  const isCreateNewProduct = paramId === CREATE_PRODUCT_PARAM;
  const [editProductState, setEditProductState] = useState<EditProductState>(initEditProductLayoutState);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const deleteImageIdRef = useRef<string>('');

  const getImageChosen: ImageControlItem | undefined = useMemo(() => {
    return editProductState.imageList.find((item) => item.isChecked);
  }, [editProductState.imageList]);

  const [categories, setCategories] = useState<Category[]>([]);

  const editProductForm = useForm<NewProductDto>({
    resolver: zodResolver(NewProductZodSchema),
    mode: 'all',
  });

  useEffect(() => {
    if (editProductState.imageList.length === 0) return;

    const isSomeChosen = editProductState.imageList.some((item) => item.isChecked);
    if (!isSomeChosen) {
      let willChange = false;
      const newImageList = editProductState.imageList.map((item, index) => {
        if (index === 0 && item.imageUrl) {
          willChange = true;

          return {
            ...item,
            isChecked: true,
          };
        }

        return item;
      });

      if (willChange) setEditProductState((pre) => ({ ...pre, imageList: [...newImageList] }));
    }

    if (!editProductState.productDetail.mainImageId) {
      let newMainImage = '';
      if (editProductState.imageList.length > 0 && editProductState.imageList[0]?.imageUrl)
        newMainImage = editProductState.imageList[0]?.id || '';

      if (newMainImage && !newMainImage.includes(MARK_AS_PREVIEW_IMAGE))
        setEditProductState((pre) => ({
          ...pre,
          productDetail: {
            ...pre.productDetail,
            mainImageId: newMainImage,
            otherImageIds: [...pre.productDetail.otherImageIds.filter((item) => item !== newMainImage)],
          },
        }));
    }
  }, [editProductState.imageList]);

  const handleChooseImage = useCallback(
    (id: string) => {
      const newImageList = editProductState.imageList.map((item) => {
        if (item.id === id)
          return {
            ...item,
            isChecked: true,
          };

        return {
          ...item,
          isChecked: false,
        };
      });

      setEditProductState((pre) => ({
        ...pre,
        imageList: [...newImageList],
      }));
    },
    [editProductState.imageList],
  );
  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const windowUrl = window.URL || window.webkitURL;
    const objectUrl = windowUrl.createObjectURL(e.target.files[0]);
    const { width, height } = await getImageSize(objectUrl);

    if (width !== height) {
      toast.error('Image must be square');

      return;
    }
    if (width <= 1000 || height <= 1000) {
      toast.error('Image must be bigger than 1000x1000');

      return;
    }

    const file = e.target.files[0];
    const tempImageId = `${MARK_AS_PREVIEW_IMAGE}_${new Date().getTime()}`;

    setEditProductState((pre: EditProductState) => ({
      ...pre,
      isImageUploading: true,
      imageList: [
        ...pre.imageList,
        {
          imageUrl: '',
          imagePreviewUrl: objectUrl,
          isChecked: false,
          id: tempImageId,
          status: ImageControlStatus.Pending,
          file,
        },
      ],
    }));

    try {
      const imageResult = await uploadImage(file, UploadFileType.ProductImage);
      if (!imageResult.success || !imageResult.data) {
        toast.error(imageResult.message);

        return;
      }

      windowUrl.revokeObjectURL(objectUrl);

      // Cancel when delete item image
      if (deleteImageIdRef.current !== tempImageId)
        setEditProductState((pre) => {
          const newImageList = [...pre.imageList].map((item) => {
            if (item.id !== tempImageId) return item;

            return {
              imageUrl: imageResult.data.preview,
              imagePreviewUrl: '',
              isChecked: false,
              id: imageResult.data._id,
              status: ImageControlStatus.Success,
            } as ImageControlItem;
          });

          return {
            ...pre,
            imageList: [...newImageList],
            productDetail: {
              ...pre.productDetail,
              otherImageIds: [...pre.productDetail.otherImageIds, imageResult.data._id],
            },
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

      setEditProductState((pre) => ({
        ...pre,
        imageList: [...pre.imageList].map((item) => {
          if (item.id === tempImageId)
            return {
              ...item,
              status: ImageControlStatus.Rejected,
            };

          return item;
        }),
        isImageUploading: false,
      }));
    }

    e.target.value = '';
  };

  const handleReUpload = useCallback(
    async (id: string) => {
      const imageItemUpload = editProductState.imageList.find((item) => item.id === id);
      if (!imageItemUpload) return;
      const { file: uploadFile, imagePreviewUrl } = imageItemUpload;
      if (!uploadFile) return;

      setEditProductState((pre) => ({
        ...pre,
        imageList: [...pre.imageList].map((item) => {
          if (item.id === id)
            return {
              ...item,
              status: ImageControlStatus.ReUploadPending,
            };

          return item;
        }),
      }));

      try {
        const imageResult = await uploadImage(uploadFile, UploadFileType.ProductImage);
        if (!imageResult.success || !imageResult.data) {
          toast.error(imageResult.message);

          return;
        }

        const windowUrl = window.URL || window.webkitURL;
        windowUrl.revokeObjectURL(imagePreviewUrl);

        // Cancel when delete item image
        if (deleteImageIdRef.current !== id)
          setEditProductState((pre) => {
            const newImageList = [...pre.imageList].map((item) => {
              if (item.id !== id) return item;

              return {
                imageUrl: imageResult.data.preview,
                imagePreviewUrl: '',
                isChecked: false,
                id: imageResult.data._id,
                status: ImageControlStatus.Success,
              } as ImageControlItem;
            });

            return {
              ...pre,
              imageList: [...newImageList],
              productDetail: {
                ...pre.productDetail,
                otherImageIds: [...pre.productDetail.otherImageIds, imageResult.data._id],
              },
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

        setEditProductState((pre) => ({
          ...pre,
          imageList: [...pre.imageList].map((item) => {
            if (item.id === id)
              return {
                ...item,
                status: ImageControlStatus.Rejected,
              };

            return item;
          }),
        }));
      }
    },
    [editProductState.imageList],
  );

  const handlePublish = async (data: NewProductDto) => {
    try {
      if (editProductState.variants.length === 0) {
        toast.warning('At least one variant!');

        return;
      }

      if (editProductState.imageList.length < 2) {
        toast.warning('Upload at least two images!');

        return;
      }

      console.log(editProductState.variants);
      const parsedVariants = NewProductVariantsZodSchema.parse(editProductState.variants);

      // Compare new variants with original variants to check if there is any changes
      parsedVariants.forEach((variant) => {
        if (!variant._id) {
          return;
        }

        const originalVariant = initialVariants.filter((item) => item._id === variant._id)[0];

        if (!originalVariant) {
          return;
        }

        if (
          originalVariant.price !== variant.price ||
          originalVariant.usPrice !== variant.usPrice ||
          originalVariant.vnShipPrice !== variant.vnShipPrice ||
          originalVariant.usShipPrice !== variant.usShipPrice ||
          originalVariant.baseCost !== variant.baseCost ||
          originalVariant.quantity !== variant.quantity ||
          originalVariant.status !== variant.status
        ) {
          // @ts-ignore
          variant.isEdited = true;
          setEditProductState((pre) => ({
            ...pre,
            variants: pre.variants
              .map((item) => {
                if (item._id === variant._id) return variant;

                return item;
              })
              .sort((a: any, b: any) => {
                const sizeA = parseInt(a.size, 10);
                const sizeB = parseInt(b.size, 10);

                return sizeA - sizeB;
              }),
          }));
        }
      });

      setEditProductState((pre) => ({
        ...pre,
        isPendingPublic: true,
      }));

      const addOrEditProductPayload: NewProductPayLoadDto = {
        ...data,
        variants: parsedVariants.sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
        ...editProductState.productDetail,
        productionTime: `${data.productionTimeStart}-${data.productionTimeEnd}`,
        shippingTime: `${data.shippingTimeStart}-${data.shippingTimeEnd}`,
        description: data.description.includes('<br') ? data.description : data.description.replaceAll('\n', '<br>'),
        personalization: data.personalization?.includes('<br')
          ? data.personalization
          : data.personalization?.replaceAll('\n', '<br>'),
        propertyOrder: editProductState.propertyOrder,
      };

      const addOrEditProductResponse = await productService.addOrEditProduct(
        addOrEditProductPayload,
        editProductState.productInfo?._id,
      );

      if (!addOrEditProductResponse.success || !addOrEditProductResponse?.data) {
        toast.error(addOrEditProductResponse.message);
      } else {
        toast.success(`${isCreateNewProduct ? 'Publish' : 'Update'} successfully`);

        // window.location.reload();
        window.location.href = `/edit-product/${addOrEditProductResponse.data._id}`;
      }

      setEditProductState((pre) => ({
        ...pre,
        isPendingPublic: false,
      }));
    } catch (error: any) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        zodError.issues.forEach((issue) => {
          console.log(issue);
          toast.error(issue.message);
        });
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleChooseMainImage = () => {
    if (!getImageChosen) return;

    if (getImageChosen.id === editProductState.productDetail.mainImageId) return;

    setEditProductState((pre) => {
      const prevMainImage = pre.productDetail.mainImageId;
      const newImageList = [...pre.imageList];

      const selectedImageIndex = editProductState.imageList.findIndex((item) => item.id === getImageChosen.id);

      if (selectedImageIndex !== -1) {
        newImageList.unshift({ ...getImageChosen });
        newImageList.splice(selectedImageIndex + 1, 1);
      }

      return {
        ...pre,
        productDetail: {
          ...pre.productDetail,
          mainImageId: getImageChosen.id,
          otherImageIds: [
            ...pre.productDetail.otherImageIds.filter((item) => item !== getImageChosen.id),
            prevMainImage,
          ],
        },
        imageList: [...newImageList],
      };
    });
  };

  const handleDeleteImageItem = useCallback((id: string) => {
    deleteImageIdRef.current = id;
    setEditProductState((pre) => {
      const newImageList = [...pre.imageList].filter((item) => item.id !== id);
      const isImageUploading = newImageList.some(
        (item) => item.id.includes(MARK_AS_PREVIEW_IMAGE) && item.status === ImageControlStatus.Pending,
      );

      return {
        ...pre,
        imageList: [...newImageList],
        productDetail: {
          ...pre.productDetail,
          mainImageId: pre.productDetail.mainImageId === id ? '' : pre.productDetail.mainImageId,
          otherImageIds: [...pre.productDetail.otherImageIds].filter((item) => item !== id),
        },
        isImageUploading,
      };
    });
  }, []);

  const fetchProductById = async (id: string) => {
    if (id === CREATE_PRODUCT_PARAM) {
      return;
    }

    const productDetailResponse = await productService.getProduct(id);
    if (!productDetailResponse.success || !productDetailResponse?.data) {
      toast.error(productDetailResponse.message);
      window.location.replace('/404');

      return;
    }

    const productDetail = productDetailResponse.data;

    editProductForm.reset({
      status: productDetail.status,
      title: productDetail.title,
      description: productDetail.description,
      productCode: productDetail.productCode,
      categoryId: productDetail.category._id,
      price: productDetail.price,
      notes: productDetail.notes,
      personalization: productDetail.personalization,
      productionTimeStart: Number(productDetail.productionTime.split('-')[0]),
      productionTimeEnd: Number(productDetail.productionTime.split('-')[1]),
      shippingTimeStart: Number(productDetail.shippingTime.split('-')[0]),
      shippingTimeEnd: Number(productDetail.shippingTime.split('-')[1]),
    });

    initialVariants = productDetail.variants;

    setEditProductState((pre) => ({
      ...pre,
      productDetail: {
        otherImageIds: [...productDetail.otherImages.map((item) => item._id)],
        mainImageId: productDetail.mainImage._id,
      },
      variants: productDetail.variants.sort((a: any, b: any) => {
        const sizeA = parseInt(a.size, 10);
        const sizeB = parseInt(b.size, 10);

        return sizeA - sizeB;
      }),
      imageList: [...productDetail.otherImages, productDetail.mainImage].map((item, index) => {
        if (index === 0)
          return {
            id: (item as CustomImageDto)._id,
            imageUrl: (item as CustomImageDto).preview,
            imagePreviewUrl: '',
            isChecked: true,
            status: ImageControlStatus.Success,
          };

        return {
          id: (item as CustomImageDto)._id,
          imageUrl: (item as CustomImageDto).preview,
          imagePreviewUrl: '',
          isChecked: false,
          status: ImageControlStatus.Success,
        };
      }),
      productInfo: productDetail,
      propertyOrder: productDetail.propertyOrder,
    }));
  };

  useEffect(() => {
    const fetchCategoryParents = async () => {
      const allCategoriesResponse = await categoryService.getAllCategories();

      if (!allCategoriesResponse.success || !allCategoriesResponse.data) {
        toast.error(allCategoriesResponse.message);

        return;
      }
      setCategories(allCategoriesResponse.data);
    };

    Promise.all([fetchCategoryParents(), fetchProductById(paramId)]);
  }, []);

  return (
    <div className="w-full p-4">
      {!isCreateNewProduct && !editProductState.productInfo ? (
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <span className="dsy-loading dsy-loading-spinner dsy-loading-lg"></span>
        </div>
      ) : (
        <div className="mx-auto my-4 w-full max-w-[1150px] bg-transparent px-4">
          <div className="flex max-w-full flex-1 flex-col items-start justify-between overflow-x-auto overflow-y-hidden bg-transparent md:flex-row">
            <div className="flex max-w-[65%] grow flex-col justify-center">
              <a href="/product-manager" className="mb-4 flex items-center gap-1">
                <ArrowLeft />
                <span className="text-lg">Back to Product Manager</span>
              </a>
              <h2 className="w-max text-3xl font-bold">
                {isCreateNewProduct ? 'New Product' : editProductState.productInfo?.title}
              </h2>
            </div>
            <div className="mt-1 flex flex-col items-start text-sm text-[#757c7e] md:mt-auto md:items-end">
              {editProductState.productInfo?.createdAt && (
                <>
                  <span>Created: {new Date(editProductState.productInfo?.createdAt).toLocaleString()}</span>
                  <span>Last modified: {new Date(editProductState.productInfo?.updatedAt || '').toLocaleString()}</span>
                </>
              )}
            </div>
          </div>

          <AreaLayout title="Mockups">
            <div className="flex w-full gap-10">
              <div className="hidden flex-col items-center gap-4 md:flex">
                {getImageChosen?.imageUrl && (
                  <>
                    <div className="w-[206px] border border-[#c4c7c8]">
                      {typeof getImageChosen.imageUrl && getImageChosen.imageUrl !== null ? (
                        <img
                          className="h-[204px] w-[204px] object-cover"
                          src={getImageChosen.imageUrl}
                          alt="display image"
                          height={208}
                          width={208}
                        />
                      ) : undefined}
                    </div>
                    <span className="cursor-pointer text-primary text-warning">Image Preview</span>
                  </>
                )}
              </div>

              <div className="flex w-[calc(100%-246px)] flex-1 flex-col gap-4">
                <div>
                  <h5 className="text-xl font-bold leading-8">Main image and others</h5>
                  <p className="text-base">Please upload high quality images</p>
                </div>

                <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
                  <div className="flex min-w-max items-center gap-4 py-[10px]">
                    {/* List Image */}
                    {editProductState.imageList.length > 0 ? (
                      editProductState.imageList.map((item) => (
                        <ImageMockUpItem
                          key={item.id}
                          imageUrl={item.imageUrl}
                          isChecked={item.isChecked}
                          id={item.id}
                          handleChoosePreview={handleChooseImage}
                          handleDeleteItem={handleDeleteImageItem}
                          isMainImage={editProductState.productDetail.mainImageId === item.id}
                          imagePreviewUrl={item.imagePreviewUrl}
                          status={item.status}
                          handleReUpload={handleReUpload}
                        />
                      ))
                    ) : (
                      <span>Don't have any image here</span>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    className="dsy-btn h-10 min-h-0 rounded-[4px]"
                    onClick={() => inputFileRef.current?.click()}
                    disabled={editProductState.isImageUploading}
                  >
                    <span className="hidden md:block">Add Image</span>
                    <span className="block md:hidden">
                      <PlusCircle />
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={inputFileRef}
                    hidden
                    onChange={handleUploadImage}
                    accept="image/png, image/webp, image/jpeg"
                  />

                  <button
                    className="dsy-btn ml-2 h-10 min-h-0 rounded-[4px] bg-primary hover:bg-[#dfa731]"
                    onClick={handleChooseMainImage}
                    disabled={editProductState.imageList.length === 0}
                  >
                    <span className="hidden md:block">Mark as main image</span>
                    <span className="block md:hidden">
                      <Bookmark />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </AreaLayout>

          <AreaLayout title="Listing details">
            <div className="flex flex-1 flex-col">
              <Form {...editProductForm}>
                <FormField
                  control={editProductForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>
                        Title
                        {!NewProductZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Title"
                          className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                          {...field}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editProductForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>
                        Description
                        {!NewProductZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea rows={15} placeholder="Description" className="mb-4 w-full text-base" {...field} />
                      </FormControl>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-between gap-2 md:flex-row">
                  <FormField
                    control={editProductForm.control}
                    name="productCode"
                    render={({ field }) => (
                      <FormItem className="mt-2 flex-1">
                        <FormLabel>
                          Product Code
                          {!NewProductZodSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product Code"
                            className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                            {...field}
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editProductForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="mt-2 flex-1">
                        <FormLabel>
                          Category{' '}
                          {!NewProductZodSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) {
                              field.onChange(value);
                            }
                          }}
                        >
                          <SelectTrigger className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea type="always" className="max-h-64">
                              {categories.length > 0
                                ? categories?.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>
                                      {c.name}
                                      {c.parent ? ` (${c.parent.name})` : ''}
                                    </SelectItem>
                                  ))
                                : null}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editProductForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>
                        Price
                        {!NewProductZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Price"
                          className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                          {...field}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editProductForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>
                        Note
                        {!NewProductZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Notes"
                          className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                          {...field}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editProductForm.control}
                  name="personalization"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>
                        Personalization
                        {!NewProductZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Personalization"
                          className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                          {...field}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col md:flex-row md:gap-12">
                  <div className="flex flex-1 justify-start gap-3">
                    <FormField
                      control={editProductForm.control}
                      name="productionTimeStart"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>
                            Product Time Start
                            {!NewProductZodSchema.shape[field.name].isOptional() && (
                              <span className="text-destructive"> *</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Product Time Start"
                              className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                              {...field}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-right"></FormLabel>
                            <FormMessage className="col-span-3" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editProductForm.control}
                      name="productionTimeEnd"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>
                            Product Time End
                            {!NewProductZodSchema.shape[field.name].isOptional() && (
                              <span className="text-destructive"> *</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Product Time End"
                              className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                              {...field}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-right"></FormLabel>
                            <FormMessage className="col-span-3" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-1 justify-start gap-3">
                    <FormField
                      control={editProductForm.control}
                      name="shippingTimeStart"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>
                            Shipping Time Start
                            {!NewProductZodSchema.shape[field.name].isOptional() && (
                              <span className="text-destructive"> *</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Shipping Time Start"
                              className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                              {...field}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-right"></FormLabel>
                            <FormMessage className="col-span-3" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editProductForm.control}
                      name="shippingTimeEnd"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormLabel>
                            Shipping Time End
                            {!NewProductZodSchema.shape[field.name].isOptional() && (
                              <span className="text-destructive"> *</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Shipping Time End"
                              className="mb-4 box-border h-[48px] w-full px-[0.75rem] text-base leading-6"
                              {...field}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-right"></FormLabel>
                            <FormMessage className="col-span-3" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </div>
          </AreaLayout>

          <AreaLayout title="Variants">
            <div className="flex max-w-full flex-1 flex-col overflow-auto">
              <p className="my-2">Please carefully check all the information below</p>

              <EditProductTable
                isCreateNewProduct={isCreateNewProduct}
                variants={editProductState.variants}
                setEditProductState={setEditProductState}
                order={editProductState.propertyOrder}
              />
            </div>
          </AreaLayout>

          <AreaLayout title="Publishing settings">
            <div className="flex flex-1 flex-col items-center">
              <p className="text-base">Please check all the above information carefully!</p>
              <Button
                className="mt-5 h-[48px] rounded-[3px] border border-[#c4c7c8] px-[23px] py-[7px] text-base hover:text-[#29ab51] disabled:bg-[#f7f7f7] disabled:text-[#9fa4a5]"
                disabled={editProductState.isPendingPublic}
                type="submit"
                onClick={editProductForm.handleSubmit(handlePublish)}
              >
                {isCreateNewProduct ? 'Publish' : 'Update'}
              </Button>
            </div>
          </AreaLayout>
        </div>
      )}

      <TebToastContainer />
    </div>
  );
};

export { EditProduct };
