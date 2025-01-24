import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { CalendarIcon, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MARK_AS_DATE } from 'shared';
import type { CustomDropdownMenuProps, DatePickerRef } from 'ui';
import {
  Button,
  Checkbox,
  CustomDialog,
  CustomDropdown,
  CustomDropdownMenu,
  DatePickerWithRange,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import { type Transaction } from '@/interfaces';
import { transactionService } from '@/services/transaction';

const filterMenu: CustomDropdownMenuProps[] = [
  {
    menuTrigger: 'Type',
    menuGroup: [
      {
        group: [
          {
            element: 'Charge',
          },
          {
            element: 'TopUp',
          },
          {
            element: 'Withdraw',
          },
          {
            element: 'Credit',
          },
          {
            element: 'Refund',
          },
        ],
      },
    ],
  },
  {
    menuTrigger: 'Method',
    menuGroup: [
      {
        group: [
          {
            element: 'Balance',
          },
          {
            element: 'Card',
          },
          {
            element: 'Paypal',
          },
          {
            element: 'Payoneer',
          },
          {
            element: 'Pingpong',
          },
        ],
      },
    ],
  },
];

const Transactions = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterArr, setFilterArr] = React.useState<string[]>([]);
  const [tempFilterArr, setTempFilterArr] = React.useState<string[]>([]);
  const datePickerRef = React.useRef<DatePickerRef>(null);

  const [isDialogFilterOpen, setIsDiaLogFilterOpen] = React.useState<boolean>(false);
  const [totalTransaction, setTotalTransaction] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const getExactOptions = React.useCallback((option: string) => {
    if (option.includes(MARK_AS_DATE)) return option.split('_')[0];

    return option;
  }, []);

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

  const handleSearchTransaction = async (value: string) => {
    setSearchValue(value);
  };

  const handleClickCancel = React.useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setIsDiaLogFilterOpen(false);
  }, []);

  const columnsTransaction: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Order/Type',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          .replace(/\//g, '-');

        return date;
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
    },
    {
      accessorKey: 'total',
      header: () => <div className="text-end">Amount</div>,
      cell: ({ row }) => {
        const transaction = row.original;
        const { currency } = transaction;
        const value = transaction.total;
        const formattedValue =
          value > 0 ? `${currency} ${value.toFixed(2)}` : `- ${currency} ${Math.abs(value).toFixed(2)}`;
        const color = value > 0 ? 'text-green-400' : 'text-rose-400';

        return <div className={`text-end font-bold ${color}`}>{formattedValue}</div>;
      },
    },
    {
      accessorKey: 'balanceAfter',
      header: () => <div className="text-end">Balance After</div>,
      cell: ({ row }) => {
        const transaction = row.original;
        const { balanceAfter, currency } = transaction;
        const formattedBalanceAfter =
          balanceAfter >= 0
            ? `${currency} ${balanceAfter.toFixed(2)}`
            : `- ${currency} ${Math.abs(balanceAfter).toFixed(2)}`;

        return <div className="text-end font-semibold">{formattedBalanceAfter}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns: columnsTransaction,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

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

  const tempMenuDropDownList = React.useMemo(() => {
    return filterMenu.map((item) => {
      if (item.menuGroup.length === 0) return item;

      const newMenuGroup = item.menuGroup.map((menuItem: { group: Array<any> }) => {
        if (menuItem.group.length === 0) return menuItem;

        const newGroup = menuItem.group.map((groupEle, elementIndex) => ({
          originElement: groupEle.element as string,
          element: (
            <div key={`${item.menuTrigger}-${elementIndex}`} className="flex h-8 cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                className="dsy-checkbox mr-2 h-[24px] w-[24px] border-primary checked:bg-primary checked:bg-[length:1.5rem_0.5rem] checked:text-foreground focus:outline-none focus:ring-0 focus-visible:outline-none"
                checked={tempFilterArr.includes(groupEle.element as string)}
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

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const transactionsResponse = await transactionService.getTransaction(pagination, searchValue, filterArr);
        const total = transactionsResponse?.total ?? 0;
        setTransactions(transactionsResponse?.data);
        setTotalTransaction(total);
        setIsLoading(false);
        if (!transactionsResponse.data.length || !transactionsResponse.success) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: DEFAULT_PAGINATION.pageIndex,
            pageSize: DEFAULT_PAGINATION.pageSize,
          }));
        }
      } catch (error) {
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded, filterArr]);

  return (
    <div className="overflow-auto pt-4">
      <div className="border-b-[1px] border-solid border-[#e3e4e5] px-4 pb-4">
        <Search placeholder="Search by Email, Order" onSearch={handleSearchTransaction} />
      </div>

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
              <CalendarIcon className="mr-2 h-4 w-4" /> Date
            </>
          }
          handleClickChooseRange={handleClickItem}
          ref={datePickerRef}
          className="w-full"
          canClearOverApply
        />
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

      <Table className="dsy-table-zebra">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {!isLoading && table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsTransaction.length} className="h-24 text-center">
                <div className="flex justify-center">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'No result'}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Pagination */}
      <div className="my-4">
        <Pagination
          name="transactions"
          total={totalTransaction}
          pagination={pagination}
          showInputPagination={{ showInput: true, showTotalOfPage: true }}
          setPagination={setPagination}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          paramUrl={[{ keyParamUrl: 'action', valueParamUrl: 'transactions' }]}
          count={transactions.length ? transactions.length : 0}
          setIsParamLoaded={setIsParamLoaded}
        />
      </div>

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
                title="Date"
                labelStyle="w-full px-6 py-4 cursor:pointer text-lg"
                rightIcon={<ChevronDown />}
                rightToggleIcon={<ChevronUp />}
                dropDownContent={
                  <DatePickerWithRange
                    popoverDefault={
                      <>
                        <CalendarIcon className="mr-2 h-4 w-4" /> Date
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

export { Transactions };
