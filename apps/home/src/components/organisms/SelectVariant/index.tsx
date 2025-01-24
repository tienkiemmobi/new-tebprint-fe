/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { ProductVariant } from 'shared';

type SelectVariantProps = {
  variants: ProductVariant[];
  variantId?: string;
  processVariantId?: (variantId: string, location?: string) => any;
};

type SelectVariantState = {
  size?: string;
  color?: string;
  style?: string;
  location?: string;
};

const findVariantById = (variants: ProductVariant[], id: string) => {
  console.log(variants, id);
  const foundVariant = variants.find((variant) => variant._id === id);
  console.log('🚀 ~ findVariantById ~ foundVariant:', foundVariant);

  return { size: foundVariant?.size, color: foundVariant?.color, style: foundVariant?.style };
};

const SelectVariant = ({ variants, variantId = '', processVariantId }: SelectVariantProps) => {
  const [selectVariantState, setSelectVariantState] = useState<SelectVariantState>(
    findVariantById(variants, variantId),
  );

  const validateCount = useRef(0);

  const hasUSLocation = variants.some((variant) => variant.usPrice);

  const uniqueSizes = [...new Set(variants.map((item) => item.size))];
  const uniqueColors = [...new Set(variants.map((item) => item.color))];
  const uniqueStyles = [...new Set(variants.filter((item) => item.style).map((item) => item.style))];

  const propertyOrder: Array<keyof SelectVariantState> = ['style', 'color', 'size', 'location'];

  // Retrieve unique values for each property based on the propertyOrder
  const uniqueValues: { [key: string]: string[] } = {
    style: uniqueStyles,
    color: uniqueColors,
    size: uniqueSizes,
    location: hasUSLocation ? ['VN', 'US'] : ['VN'],
  };

  const handleSelectChange = (key: keyof SelectVariantState, value: string) => {
    console.log(key, value);
    // if (key === 'location') {
    //   return;
    // }

    setSelectVariantState((pre) => {
      return {
        ...pre,
        [key]: pre[key] === value ? undefined : value,
      };
    });
  };

  const isAllowed = (property: keyof SelectVariantState, value: string) => {
    if (property === 'location') {
      return true;
    }

    const selectedValues = { ...selectVariantState, [property]: value };
    const allowedVariants = variants.filter((variant) => {
      return Object.keys(selectedValues).every((key) => {
        if (key === 'location') {
          return true;
        }
        if (selectedValues[key as keyof SelectVariantState]) {
          // Check if the variant is active
          if (variant.status !== 'active') {
            return false;
          }

          return variant[key as keyof ProductVariant] === selectedValues[key as keyof SelectVariantState];
        }

        return true;
      });
    });

    return allowedVariants.length > 0;
  };

  const renderOptions = (property: keyof SelectVariantState) => {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {uniqueValues[property]?.map((value, index) => (
          <a
            key={index}
            className={`box-border inline-block h-10 min-w-[40px] cursor-pointer rounded-[5px] border border-[#ccc] bg-white p-1 text-center text-base font-bold leading-[28px] hover:bg-[#cac4c4] hover:shadow ${
              !isAllowed(property, value) && 'pointer-events-none opacity-25'
            } ${selectVariantState[property] === value && 'border-2 border-primary'}`}
            onClick={() => handleSelectChange(property, value)}
          >
            {value}
          </a>
        ))}
      </div>
    );
  };

  useEffect(() => {
    Object.keys(uniqueValues).forEach((option: string) => {
      setSelectVariantState((pre) => ({
        ...pre,
        [option]: uniqueValues[option]![0],
      }));
    });
  }, []);

  useEffect(() => {
    console.log(selectVariantState);
    if (validateCount.current > 0) {
      if (selectVariantState.size && selectVariantState.color) {
        const variantFilters = variants.filter(
          (item) =>
            item.color === selectVariantState.color &&
            item.style === selectVariantState.style &&
            item.size === selectVariantState.size,
        );

        if (variantFilters.length === 0) {
          toast.error('Something went wrong');

          return;
        }

        processVariantId!(variantFilters[0]!._id, selectVariantState.location);

        // if (
        //   processVariantId &&
        //   variantFilters.length === 1 &&
        //   (!variantFilters[0]!.style || variantFilters[0]!.style === selectVariantState.style)
        // ) {
        //   processVariantId(variantFilters[0]!._id);
        // } else if (processVariantId) {
        //   processVariantId('');
        // }
      } else if (processVariantId) {
        processVariantId('', selectVariantState.location);
      }
    } else {
      console.log('else');
    }

    validateCount.current += 1;
  }, [selectVariantState.color, selectVariantState.size, selectVariantState.style, selectVariantState.location]);

  return (
    <>
      {propertyOrder.map((property) => (
        <div className={`${property.includes('style') || property.includes('color') ? 'zhidden' : ''}`} key={property}>
          <h6 className="my-2 font-bold capitalize">Choose {property}</h6>
          {renderOptions(property)}
        </div>
      ))}
    </>
  );
};

export { SelectVariant };
