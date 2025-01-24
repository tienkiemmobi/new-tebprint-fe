import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { PaginationState } from '@tanstack/react-table';
import { CalendarIcon, ChevronDown, ChevronUp, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { MARK_AS_DATE } from 'shared';
import type { CustomDropdownMenuProps, DatePickerRef } from 'ui';
import {
  Button,
  Checkbox,
  CustomDialog,
  CustomDropdown,
  CustomDropdownMenu,
  DatePickerWithRange,
  Flag,
  Pagination,
  Search,
} from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { Invoice } from '@/interfaces';

const invoices: Invoice[] = [
  {
    invoiceNumber: '145',
    period: 'Aug 2022',
    currency: 'USD',
    total: '43003.28',
    flag: 'US',
    region: 'US',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: '146',
    period: 'Aug 2022',
    currency: 'USD',
    total: '43003.28',
    flag: 'US',
    region: 'US',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: '147',
    period: 'Aug 2022',
    currency: 'USD',
    total: '43003.28',
    flag: 'US',
    region: 'US',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.133539',
    period: 'Aug 2022',
    currency: 'USD',
    total: '433.28',
    flag: 'GB',
    region: 'EU',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.133538',
    period: 'Aug 2022',
    currency: 'USD',
    total: '432.23',
    flag: 'GB',
    region: 'UK',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.136537',
    period: 'Aug 2022',
    currency: 'USD',
    total: '431.21',
    flag: 'GB',
    region: 'NW',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.133549',
    period: 'Aug 2022',
    currency: 'USD',
    total: '433.28',
    flag: 'GB',
    region: 'EU',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.133568',
    period: 'Aug 2022',
    currency: 'USD',
    total: '432.23',
    flag: 'GB',
    region: 'UK',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'GB2022.143537',
    period: 'Aug 2022',
    currency: 'USD',
    total: '431.21',
    flag: 'GB',
    region: 'NW',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'CA9',
    period: 'Aug 2022',
    currency: 'USD',
    total: '433.28',
    flag: 'CA',
    region: 'CA',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'CA8',
    period: 'Aug 2022',
    currency: 'USD',
    total: '432.23',
    flag: 'CA',
    region: 'CA',
    createdAt: '31.07.2923',
  },
  {
    invoiceNumber: 'CA7',
    period: 'Aug 2022',
    currency: 'USD',
    total: '431.21',
    flag: 'CA',
    region: 'CA',
    createdAt: '31.07.2923',
  },
];

const filterMenu: CustomDropdownMenuProps[] = [
  {
    menuTrigger: 'Type',
    menuGroup: [
      {
        group: [
          {
            element: 'Other invoice',
          },
          {
            element: 'Credit note',
          },
          {
            element: 'Subscription invoice',
          },
        ],
      },
    ],
  },
  {
    menuTrigger: 'Region',
    menuGroup: [
      {
        group: [
          {
            element: 'US',
          },
          {
            element: 'CA',
          },
          {
            element: 'EU',
          },
          {
            element: 'AU & NZ',
          },
          {
            element: 'Others',
          },
        ],
      },
    ],
  },
  {
    menuTrigger: 'Store',
    menuGroup: [
      {
        group: [
          {
            element: 'My New Store',
          },
        ],
      },
    ],
  },
];

const PerOrderInvoices = () => {
  const [filterArr, setFilterArr] = React.useState<string[]>([]);
  const [tempFilterArr, setTempFilterArr] = React.useState<string[]>([]);

  const [isDialogFilterOpen, setIsDiaLogFilterOpen] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState<PaginationState>(DEFAULT_PAGINATION);
  const [currentData, setCurrentData] = React.useState<Invoice[]>([]);

  const datePickerRef = React.useRef<DatePickerRef>(null);

  const handleClickItem = React.useCallback((filterName: string, isDate?: boolean, isTemp?: boolean) => {
    if (!isTemp)
      setFilterArr((pre) => {
        let newFilterName = filterName;
        if (!newFilterName) return pre;

        if (isDate) newFilterName += `_${MARK_AS_DATE}`;

        let newFilterArr = [...pre];
        if (pre.includes(newFilterName)) newFilterArr = newFilterArr.filter((item) => item !== newFilterName);
        else newFilterArr.push(newFilterName);

        return newFilterArr;
      });
    else
      setTempFilterArr((pre) => {
        let newFilterName = filterName;
        if (!newFilterName) return pre;

        if (isDate) newFilterName += `_${MARK_AS_DATE}`;

        let newFilterArr = [...pre];
        if (pre.includes(newFilterName)) newFilterArr = newFilterArr.filter((item) => item !== newFilterName);
        else newFilterArr.push(newFilterName);

        return newFilterArr;
      });
  }, []);

  const menuDropDownList = React.useMemo(() => {
    return filterMenu.map((item) => {
      if (item.menuGroup.length === 0) return item;

      const newMenuTrigger = (
        <Button variant="outline" className="w-full">
          {item.menuTrigger}
        </Button>
      );

      const newMenuGroup = item.menuGroup.map((menuItem) => {
        if (menuItem.group.length === 0) return menuItem;

        const newGroup = menuItem.group.map((groupEle, elementIndex) => ({
          originElement: groupEle.element as string,
          element: (
            <div key={`${item.menuTrigger}-${elementIndex}`} className="flex h-8 cursor-pointer items-center gap-1">
              <Checkbox className="mr-2 h-[24px] w-[24px]" checked={filterArr.includes(groupEle.element as string)} />
              <span>{groupEle.element}</span>
            </div>
          ),
          handleOnClick: () => handleClickItem(groupEle.element as string),
        }));

        return { group: [...newGroup] };
      });

      return { ...item, menuTrigger: newMenuTrigger, menuGroup: [...newMenuGroup] };
    });
  }, [filterArr]);

  const tempMenuDropDownList = React.useMemo(() => {
    return filterMenu.map((item) => {
      if (item.menuGroup.length === 0) return item;

      const newMenuGroup = item.menuGroup.map((menuItem) => {
        if (menuItem.group.length === 0) return menuItem;

        const newGroup = menuItem.group.map((groupEle, elementIndex) => ({
          originElement: groupEle.element as string,
          element: (
            <div key={`${item.menuTrigger}-${elementIndex}`} className="flex h-8 cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                className="dsy-checkbox mr-2 h-[24px] w-[24px] border-primary checked:bg-primary checked:bg-[length:1.5rem_0.5rem] checked:text-foreground focus:outline-none focus:ring-0 focus-visible:outline-none"
                checked={tempFilterArr.includes(groupEle.element as string)}
                onChange={() => {}}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 12'%3e %3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M1 5.917 5.724 10.5 15 1.5'/%3e %3c/svg%3e")`,
                }}
              />
              <span>{groupEle.element}</span>
            </div>
          ),
          handleOnClick: () => handleClickItem(groupEle.element as string, false, true),
        }));

        return { group: [...newGroup] };
      });

      return { ...item, menuGroup: [...newMenuGroup] };
    });
  }, [tempFilterArr]);

  const handleClickClearItem = (option: string, isDate?: boolean) => {
    setFilterArr((pre) => {
      if (isDate) datePickerRef.current?.resetDatePicked();

      return [...pre].filter((item) => item !== option);
    });
  };

  const handleClickClearAll = React.useCallback(() => {
    datePickerRef.current?.resetDatePicked();
    setFilterArr(() => []);
  }, []);

  const getExactOptions = React.useCallback((option: string) => {
    if (option.includes(MARK_AS_DATE)) return option.split('_')[0];

    return option;
  }, []);

  const handleOpenDialogFilter = React.useCallback(() => {
    setIsDiaLogFilterOpen(true);
    setTempFilterArr(() => [...filterArr]);
  }, [filterArr]);

  const handleClickApply = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      const newFilterArr = [...tempFilterArr].filter((item) => getExactOptions(item) === item);
      if (datePickerRef.current?.getCurDatePicking()) newFilterArr.push(datePickerRef.current?.getCurDatePicking());
      setFilterArr(() => [...newFilterArr]);

      setIsDiaLogFilterOpen(false);
    },
    [tempFilterArr],
  );

  const handleClickCancel = React.useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setIsDiaLogFilterOpen(false);
  }, []);

  function getDataByPagination(params: Invoice[], paginationPage: PaginationState) {
    const startIndex = (paginationPage.pageIndex - 1) * paginationPage.pageSize;
    const endIndex = startIndex + paginationPage.pageSize;

    return params.slice(startIndex, endIndex);
  }

  useEffect(() => {
    setCurrentData(getDataByPagination(invoices, pagination));
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <div>
      <div className="mt-4 flex lg:mt-8">
        <h2 className="font-bold">Per order invoices</h2>
      </div>
      <p className="my-2 text-sm text-[#686F71]">
        Per order invoicing provides individual invoices for each order. You can choose the frequency and format of your
        invoices by switching between <i>Summary</i> and <i>Per order invoicing</i> from <u>the Settings page</u>.
      </p>
      <Search placeholder="Search for invoices" />

      <div className="mt-8 hidden sm:flex">
        {menuDropDownList.map((item, index) => (
          <CustomDropdownMenu
            key={index}
            menuTrigger={item.menuTrigger}
            menuGroup={item.menuGroup}
            labelMenu={item.labelMenu}
          />
        ))}
        <DatePickerWithRange
          popoverDefault={
            <>
              <CalendarIcon className="mr-2 h-4 w-4" /> Period
            </>
          }
          handleClickChooseRange={handleClickItem}
          ref={datePickerRef}
          className="w-full"
          canClearOverApply
        />
      </div>

      <div className="mt-8 block sm:hidden">
        <Button variant="outline" className="w-full" onClick={handleOpenDialogFilter}>
          Filter Invoices
        </Button>
      </div>

      {filterArr.length !== 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {filterArr.map((item) => (
            <button
              className="flex h-8 cursor-pointer items-center justify-between gap-1 rounded border border-[#c4c7c8] bg-[#f7f7f7] p-1 text-base text-[#17262b] transition hover:border-[##9fa4a5] hover:bg-[#c4c7c8]"
              key={item}
            >
              <span>{getExactOptions(item)}</span>
              <X className="h-4 w-4" onClick={() => handleClickClearItem(item, getExactOptions(item) !== item)} />
            </button>
          ))}
          <button
            className="h-8 cursor-pointer rounded p-1 text-base font-medium text-[#17262b] transition hover:bg-[#17262b1a]"
            onClick={handleClickClearAll}
          >
            <span>Clear All</span>
          </button>
        </div>
      )}

      {currentData?.length > 0 ? (
        <div className="no-scrollbar overflow-scroll">
          <table className="dsy-table dsy-table-zebra mt-4 overflow-x-auto text-base">
            <thead>
              <tr>
                <th>
                  <Checkbox id="all" />
                </th>
                <th>Name</th>
                <th>Region</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Created</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((invoice) => {
                return (
                  <tr key={invoice.invoiceNumber}>
                    <td>
                      <Checkbox />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {invoice.flag ? (
                          <span className="flex h-[25px] w-[25px] items-center justify-center">
                            <Flag code={`${invoice.flag}`} />
                          </span>
                        ) : (
                          ''
                        )}
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td>{invoice.region}</td>
                    <td>#1951705.354</td>
                    <td className="flex items-center">
                      {invoice.currency} {invoice.total}
                    </td>
                    <td>{invoice.createdAt}</td>
                    <td>
                      <a href={'/files/invoices_example.pdf'} download={'invoices_example.pdf'}>
                        <FontAwesomeIcon icon={faDownload} size="sm" className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 lg:py-16">
          <img src="/assets/empty.svg" alt="Empty" />
          <p className="mt-2 font-bold">No invoices yet</p>
        </div>
      )}

      {/* Pagination */}

      <Pagination
        name="invoices"
        total={invoices.length}
        pagination={pagination}
        showInputPagination={{ showInput: true, showTotalOfPage: true }}
        setPagination={setPagination}
        isOffline={true}
        count={invoices.length}
      />
      {/* End pagination */}

      <CustomDialog
        open={isDialogFilterOpen}
        handleClose={() => setIsDiaLogFilterOpen(false)}
        formProperty={{ className: 'w-full h-full rounded-none' }}
        dialogContent={
          <>
            <div className="flex items-center justify-between border-b border-[#e3e4e5] p-6">
              <h5 className="text-lg font-bold">Filter Invoices</h5>
              <span
                className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[#c4c7c8] text-[#17262b]"
                onClick={() => setIsDiaLogFilterOpen(false)}
              >
                <X />
              </span>
            </div>
            <div className="h-[calc(100vh-81px-130px)] overflow-y-auto p-6 ssm:h-[calc(100vh-81px-74px)]">
              {tempMenuDropDownList.map((item) => (
                <CustomDropdown
                  key={item.menuTrigger as string}
                  title={item.menuTrigger as string}
                  labelStyle="w-full px-6 py-4 cursor:pointer text-lg"
                  rightIcon={<ChevronDown />}
                  rightToggleIcon={<ChevronUp />}
                  dropDownContent={
                    <div className="flex flex-col gap-2 px-6 pb-6 pt-1">
                      {item.menuGroup.map((subItem) =>
                        subItem.group.map((nestItem, nestIndex) => (
                          <div
                            key={nestIndex}
                            onClick={() => {
                              setTempFilterArr((pre) => {
                                const newFilterName = nestItem.originElement;
                                if (!newFilterName) return pre;

                                let newFilterArr = [...pre];
                                if (pre.includes(newFilterName))
                                  newFilterArr = newFilterArr.filter((item1) => item1 !== newFilterName);
                                else newFilterArr.push(newFilterName);

                                return newFilterArr;
                              });
                            }}
                          >
                            {nestItem.element}
                          </div>
                        )),
                      )}
                    </div>
                  }
                />
              ))}
              <CustomDropdown
                title="Period"
                labelStyle="w-full px-6 py-4 cursor:pointer text-lg"
                rightIcon={<ChevronDown />}
                rightToggleIcon={<ChevronUp />}
                dropDownContent={
                  <DatePickerWithRange
                    popoverDefault={
                      <>
                        <CalendarIcon className="mr-2 h-4 w-4" /> Period
                      </>
                    }
                    ref={datePickerRef}
                    className="w-full"
                    isDropDown
                  />
                }
              />
            </div>
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-start gap-4 border border-b-[#e3e4e5] bg-background px-6 py-4 ssm:flex-row-reverse">
              <Button variant="secondary" className="bg-[#29ab51]" onClick={handleClickApply}>
                Apply Filter
              </Button>
              <Button variant="outline" onClick={handleClickCancel}>
                Cancel
              </Button>
            </div>
          </>
        }
      />
    </div>
  );
};

export { PerOrderInvoices };
