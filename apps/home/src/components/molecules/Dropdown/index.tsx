import React, { memo, useEffect, useState } from 'react';
import { Checkbox, Label, RadioGroup, RadioGroupItem } from 'ui';
import { useStore } from 'zustand';

import type { ProductStore } from '@/store';
import { useProductStore } from '@/store';

type CustomLabelProps = {
  isChangeIcon?: boolean;
} & Omit<DropdownProps, 'categoryFilter' | 'listItems'>;

export type DropdownProps = {
  title?: string;
  className?: string;
  statusDropdown?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightToggleIcon?: React.ReactNode;
  leftToggleIcon?: React.ReactNode;
  listItems: string[];
  typeElement?: string;
  isOpenDropdown?: boolean;
  isOpenDropDown?: boolean;
};
const CustomLabel = (props: CustomLabelProps) => {
  const { title, statusDropdown, isChangeIcon, rightIcon, rightToggleIcon } = props;

  return (
    <>
      <div className="flex w-full items-center">
        <div className="flex w-3/4 md:justify-between lg:justify-normal">
          <span className="text-[16px] font-bold leading-6 text-color">{title}</span>
          {statusDropdown && (
            <span className="rounded-[3px] border border-[#248E4C] bg-[#E2F7E3] px-2 py-[2px] text-sm font-medium leading-5 text-[#1F6B45] md:m-0 lg:ml-6">
              {statusDropdown}
            </span>
          )}
        </div>
        <div className="flex w-1/4 justify-end">{isChangeIcon ? rightToggleIcon : rightIcon}</div>
      </div>
    </>
  );
};

const Dropdown = memo((props: DropdownProps) => {
  const { className, title, statusDropdown, rightIcon, rightToggleIcon, listItems, typeElement, isOpenDropDown } =
    props;

  const useFilter = <T,>(selector: (state: ProductStore) => T) => useStore(useProductStore, selector);
  const [searchParam, setSearchParam] = useState<string>('');

  const { toggleProperty, selectedVariants, selectedCategories } = useFilter((state) => state);
  const [dropDownOpen, setDropDownOpen] = React.useState<boolean>(isOpenDropDown || false);
  const [valueRadio, setValueRadio] = useState<string>('');

  const handleDropdown = () => {
    setDropDownOpen(!dropDownOpen);
  };

  useEffect(() => {
    const queryString = window.location.search;

    const searchParams = new URLSearchParams(queryString);

    const qValue = searchParams.get('category') || '';

    setSearchParam(qValue);
    if (qValue) {
      toggleProperty('selectedCategories', qValue);
    }
  }, []);

  useEffect(() => {
    if (!valueRadio) {
      return;
    }
    window.history.replaceState('', '', `?category=${valueRadio}`);
  }, [valueRadio]);

  return (
    <div className="relative h-full w-full border-gray-500">
      <button onClick={handleDropdown} className="w-full py-2">
        <CustomLabel
          rightIcon={rightIcon}
          rightToggleIcon={rightToggleIcon}
          isChangeIcon={dropDownOpen}
          statusDropdown={statusDropdown}
          title={title}
        />
      </button>
      <div
        className={
          dropDownOpen
            ? 'block h-auto w-full bg-transparent pb-6 duration-500 ease-in'
            : 'hidden h-0 w-full bg-transparent duration-1000 ease-in'
        }
      >
        {typeElement === 'radioButton' ? (
          <>
            <RadioGroup
              defaultValue={searchParam}
              value={selectedCategories}
              onValueChange={(value: string) => {
                toggleProperty('selectedCategories', value);
                setValueRadio(value);
              }}
            >
              {listItems?.map((item, index) => (
                <div key={`${item}_${title}_${index}`} className="flex items-center space-x-2">
                  <RadioGroupItem value={item} id={`${item}_${title}_${index}`} />
                  <Label htmlFor={`${item}_${title}_${index}`} className="cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </>
        ) : (
          <>
            {listItems?.map((item, index) => (
              <div key={`${item}_${title}_${index}`} className={className}>
                <Checkbox
                  onClick={() => toggleProperty('selectedVariants', `${item}${title}`)}
                  checked={selectedVariants.includes(`${item}${title}`)}
                  id={`${item}_${title}_${index}`}
                />
                {item && (
                  <label htmlFor={`${item}_${title}_${index}`} className="cursor-pointer pl-5">
                    {item}
                  </label>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
});

export { Dropdown };
