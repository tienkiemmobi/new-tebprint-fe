import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import type { Product } from 'shared';
import { Button, Search, TebToastContainer } from 'ui';

import { ListProducts, SelectVariant } from '@/components';
import type { MeDto } from '@/interfaces';
import { Footer } from '@/layouts';
import { useAuthStore } from '@/store';

type ProductDetailProps = {
  productDetail: Product;
  relatedProductsList: Product[];
};

type ProductDetailState = {
  selectImageIndex: number;
  user?: MeDto;
  variantId?: string;
  location?: string;
};

const ProductDetail: React.FC<ProductDetailProps> = ({ productDetail, relatedProductsList }) => {
  const {
    category,
    mainImage,
    title,
    description,
    personalization,
    otherImages,
    variants,
    price,
    shippingTime,
    _id,
    productionTime,
  } = productDetail;

  const displayPrice = useRef<HTMLSpanElement>(null);
  const selectedVariantCodeRef = useRef<HTMLSpanElement>(null);

  const [currentShipPrice, setCurrentShipPrice] = useState(0);

  const [productDetailState, setProductDetailState] = useState<ProductDetailState>({
    selectImageIndex: 0,
  });

  const updatedOtherImages = [mainImage, ...otherImages];
  const getRandomFourProducts = (product: Product[]) => {
    const randomProducts = [...product];
    const result = [];

    for (let i = 0; i < 4 && randomProducts.length > 0; i += 1) {
      const randomIndex = Math.floor(Math.random() * randomProducts.length);
      const selectedProduct = randomProducts.splice(randomIndex, 1)[0] as Product;
      result.push(selectedProduct);
    }

    return result;
  };

  const randomFourProducts = getRandomFourProducts(relatedProductsList);

  const estimateDelivery = (ranges: string[]) => {
    let startDay = 0;
    let endDay = 0;

    ranges.forEach((range) => {
      const [startDiff, endDiff] = range.split('-').map((part) => parseInt(part, 10));

      if (startDiff && endDiff) {
        startDay += startDiff;
        endDay += endDiff;
      }
    });

    const fromDate = dayjs().add(startDay, 'days').format('MM/DD');

    const toDate = dayjs().add(endDay, 'days').format('MM/DD');

    return `${fromDate} - ${toDate}`;
  };

  const handleStartOrder = () => {
    window.location.href = productDetailState.variantId
      ? `/create-order?productId=${_id}&variantId=${productDetailState.variantId}`
      : '/create-order';
  };

  const handleChangeProduct = (step: number) => {
    const { length } = updatedOtherImages;
    const tempStep = step % length;

    setProductDetailState((pre) => {
      let newIndex = pre.selectImageIndex + tempStep;
      if (newIndex >= length) newIndex -= length;
      else if (newIndex < 0) newIndex += length;

      return {
        ...pre,
        selectImageIndex: newIndex,
      };
    });
  };

  useEffect(() => {
    setProductDetailState((pre) => ({
      ...pre,
      user: useAuthStore.getState().user || undefined,
    }));
  }, []);

  useEffect(() => {
    const variant = variants.find((item) => item._id === productDetailState.variantId);
    const currentPrice = variant?.price;

    const currentUSPrice = variant?.usPrice;

    const shipPrice = productDetailState.location === 'US' ? variant?.usShipPrice : variant?.vnShipPrice;

    setCurrentShipPrice(shipPrice || 0);

    const currentVariantCode = variant?.code;

    selectedVariantCodeRef.current.innerHTML = currentVariantCode;

    if (displayPrice?.current) {
      displayPrice.current.innerHTML = productDetailState.location === 'US' ? `$${currentUSPrice}` : `$${currentPrice}`;
    }
  }, [productDetailState.variantId, productDetailState.location]);

  return (
    <>
      <div className="ml-0 mt-[78px] max-h-0 min-h-[calc(100vh-78px)] w-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1152px] p-4 px-10">
          <Search />
          <div className="py-4">
            <a href="/catalog" className="dsy-link font-bold hover:no-underline">
              Catalog
            </a>
            {' > '}
            <a href={`/products?category=${category.name}`} className="dsy-link font-bold hover:no-underline">
              {category?.name}
            </a>
          </div>
          <div className="flex flex-col justify-center gap-4 lg:flex lg:flex-row lg:justify-start lg:gap-10">
            <div className="relative flex pb-[76px] lg:pb-0">
              <div className="absolute inset-x-0 bottom-0 mt-2 lg:relative">
                <div className="relative px-6 py-0 lg:mr-8 lg:px-0 lg:py-6">
                  <div
                    className="absolute inset-y-0 left-0 flex cursor-pointer select-none items-center justify-center bg-white opacity-[0.7] hover:opacity-100 lg:inset-x-0 lg:bottom-auto lg:top-0"
                    onClick={() => handleChangeProduct(-1)}
                  >
                    <FontAwesomeIcon
                      className="block h-[24px] w-[24px] rotate-[-0.25turn] lg:rotate-0"
                      icon={faChevronUp}
                    />
                  </div>
                  <div className="flex max-h-[500px] w-full max-w-full flex-row items-center gap-2 overflow-auto lg:h-full lg:w-auto lg:flex-col">
                    {updatedOtherImages.map((item, index) => {
                      return (
                        <img
                          onClick={() => {
                            setProductDetailState((pre) => ({
                              ...pre,
                              selectImageIndex: index,
                            }));
                          }}
                          className={`mb-1 h-[72px] w-[72px] cursor-pointer rounded-sm border-b-4 border-white hover:border-[#ccc] ${
                            index === productDetailState.selectImageIndex && '!border-[#ed4642]'
                          }`}
                          key={`img-${index}`}
                          src={item.preview}
                        />
                      );
                    })}
                  </div>
                  <div
                    className="absolute inset-y-0 right-0 flex cursor-pointer select-none items-center justify-center bg-white opacity-[0.7] hover:opacity-100 lg:inset-x-0 lg:bottom-0 lg:top-auto"
                    onClick={() => handleChangeProduct(1)}
                  >
                    <FontAwesomeIcon
                      className="block h-[24px] w-[24px] rotate-[-0.25turn] lg:rotate-0"
                      icon={faChevronDown}
                    />
                  </div>
                </div>
              </div>
              <div className="mx-auto flex h-full w-full items-center justify-center p-[20px] sm:h-[480px] sm:w-[346px] lg:h-[754] lg:w-[528px]">
                <img className="rounded-xl" src={updatedOtherImages[productDetailState.selectImageIndex]?.preview} />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6 flex items-center gap-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                {/* <button className="flex h-10 w-10 items-center justify-center rounded-[50%] border bg-white focus:outline-none">
                  <FontAwesomeIcon className="h-6 w-6 text-primary" icon={heart} />
                </button> */}
              </div>
              <div className="mb-2 border-b border-[#ccc]"></div>

              <div className="mb-8">
                <SelectVariant
                  variants={variants}
                  processVariantId={(variantId, location) => {
                    setProductDetailState((pre) => ({
                      ...pre,
                      variantId,
                      location,
                    }));
                  }}
                />
              </div>

              {personalization && (
                <div className="mb-8">
                  <p className="mb-2 font-bold text-warning">Add your personalization</p>
                  <p dangerouslySetInnerHTML={{ __html: personalization }}></p>
                </div>
              )}

              <div>
                <span className="mr-1 font-semibold">Variant ID:</span>
                <p ref={selectedVariantCodeRef} className="mb-2 inline font-bold text-warning"></p>
              </div>

              <div className="mb-4 mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#f8f8f8] p-3">
                  <h6 className="font-bold">Price</h6>
                  <div className="mt-8">
                    <p className="text-2xl font-bold">
                      <span ref={displayPrice} className="text-destructive">
                        ${price}
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      <span className="text-warning">
                        {currentShipPrice ? `Estimate Shipping: $${currentShipPrice}` : ''}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f8f8f8] p-3">
                  <h6 className="font-bold">Estimated delivery to</h6>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-6 bg-contain bg-no-repeat "
                      style={{
                        backgroundImage:
                          'url("https://static.cdn.printful.com/static/v864/images/layout/flags/us.svg")',
                      }}
                    ></span>
                    <span>US</span>
                  </div>
                  <div className="mt-4 text-2xl font-bold">
                    <span>{estimateDelivery([productionTime, shippingTime])}</span>
                  </div>
                  <span className="text-sm text-[#555]">Shipping time: {shippingTime} days</span>
                </div>
              </div>

              {productDetailState.user?.email && (
                <Button
                  className="w-full bg-primary"
                  onClick={handleStartOrder}
                  disabled={!productDetailState.variantId}
                >
                  Start new order
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col border-b border-gray-300 py-10 lg:flex lg:flex-row lg:justify-between">
            <h2 className="pb-6 text-[35px] font-bold leading-8">Description</h2>
            <p className="w-full font-normal leading-6 lg:w-[718px]">
              <p dangerouslySetInnerHTML={{ __html: description }}></p>
            </p>
          </div>
          <div className="flex flex-col border-b border-gray-300 py-10 lg:flex lg:flex-row lg:justify-between">
            <h2 className="pb-6 text-[35px] font-bold leading-8">Size guide</h2>
            <p className="w-full font-normal leading-6 lg:w-[718px]">
              All measurements in the table refer to product dimensions.
            </p>
          </div>
          <div className="py-10">
            <h6 className="pb-6 text-[23px] font-bold leading-8">You may also like</h6>
            <div className="h-full w-full">
              <ListProducts
                className="flex w-full justify-center md:w-1/2 lg:w-1/4"
                listProducts={randomFourProducts}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer classes="min-h-[100px] w-full px-6 pt-6 lg:w-full lg:w-[1150px]" />
      <TebToastContainer />
    </>
  );
};

export { ProductDetail };
