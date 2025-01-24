import type { ColumnDef, ExpandedState, PaginationState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Minus, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { handleSeparateValue, toTitleCaseKey } from 'shared';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  NoOrderResult,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';
import * as XLSX from 'xlsx';

import { DEFAULT_PAGINATION } from '@/constants';
import type { OrdersImportExpenseTableDto, OrdersImportItemDto } from '@/interfaces';
import { orderService } from '@/services';

type OrdersImportTableProps = {
  data: OrdersImportItemDto[];
  csvContent: string;
  hasError: boolean;
  children?: React.ReactNode;
  resetOrder: (...args: any) => any;
};

const handleConvertToIOrderTableExpenses = (data: OrdersImportItemDto[]): OrdersImportExpenseTableDto[] => {
  const groupedItemsMap: Record<string, OrdersImportExpenseTableDto> = {};

  data.forEach((item) => {
    const { externalId } = item;

    if (!groupedItemsMap[externalId]) {
      groupedItemsMap[externalId] = {
        ...item,
        expenses: [
          {
            quantity: item.quantity,
            variantId: item.variantId,
            frontArtworkUrl: item.frontArtworkUrl,
            backArtworkUrl: item.backArtworkUrl || '',
            mockupUrl1: item.mockupUrl1 || '',
            mockupUrl2: item.mockupUrl2 || '',
            note: item.note || '',
          },
        ],
        quantity: item.quantity,
        variantId: item.variantId,
        frontArtworkUrl: item.frontArtworkUrl,
        backArtworkUrl: item.backArtworkUrl,
        note: item.note,
      };
    } else {
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).expenses.push({
        quantity: item.quantity,
        variantId: item.variantId,
        frontArtworkUrl: item.frontArtworkUrl,
        backArtworkUrl: item.backArtworkUrl || '',
        mockupUrl1: item.mockupUrl1 || '',
        mockupUrl2: item.mockupUrl2 || '',
        note: item.note,
      });
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).quantity = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).variantId = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).frontArtworkUrl = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).backArtworkUrl = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).mockupUrl1 = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).mockupUrl2 = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).note = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).giftMessage = '';
      (groupedItemsMap[externalId] as OrdersImportExpenseTableDto).externalLink = '';
    }
  });

  const orderTableExpenses: OrdersImportExpenseTableDto[] = Object.values(groupedItemsMap);

  return JSON.parse(JSON.stringify(orderTableExpenses));
};

const cellStyle = 'text-base whitespace-nowrap flex flex-col justify-start';
const cellError = 'text-[#ce364f]';
const cellDetail = 'text-[#998b8b] font-semibold';

export const columns: ColumnDef<OrdersImportExpenseTableDto>[] = [
  {
    id: 'collapse',
    header: '',
    cell: ({ row }) => {
      return (
        <>
          {row.getCanExpand() && row.original.expenses.length > 1 && (
            <Button
              className="flex h-[30px] w-[30px] items-center justify-center p-0"
              onClick={row.getToggleExpandedHandler()}
            >
              {row.getIsExpanded() ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          )}
        </>
      );
    },
  },
  {
    id: 'externalId',
    header: 'External ID',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div order-external-id="true">{handleSeparateValue(row.original.externalId).value}</div>
        <p className={handleSeparateValue(row.original.externalId).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.externalId).message}
        </p>
      </div>
    ),
  },
  {
    id: 'designerName',
    header: 'Designer Name',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.designerName || '').value}</div>
      </div>
    ),
  },
  {
    header: 'Shipping Method',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.shippingMethod || '').value}</div>
        <p className={handleSeparateValue(row.original.shippingMethod || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.shippingMethod || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'First Name',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.firstName).value}</div>
        <p className={handleSeparateValue(row.original.firstName).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.firstName).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Last Name',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.lastName).value}</div>
        <p className={handleSeparateValue(row.original.lastName).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.lastName).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Email',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.email || '').value}</div>
        <p className={handleSeparateValue(row.original.email || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.email || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'Phone',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.phone || '').value}</div>
        <p className={handleSeparateValue(row.original.phone || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.phone || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'Country',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.country).value}</div>
        <p className={handleSeparateValue(row.original.country).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.country).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Region',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.region).value}</div>
        <p className={handleSeparateValue(row.original.region).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.region).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Address Line 1',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.addressLine1).value}</div>
        <p className={handleSeparateValue(row.original.addressLine1).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.addressLine1).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Address Line 2',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.addressLine2 || '').value}</div>
        <p className={handleSeparateValue(row.original.addressLine2 || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.addressLine2 || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'City',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.city).value}</div>
        <p className={handleSeparateValue(row.original.city).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.city).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Zip',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.zip).value}</div>
        <p className={handleSeparateValue(row.original.zip).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.zip).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Store Code',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.storeCode).value}</div>
        <p className={handleSeparateValue(row.original.storeCode).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.storeCode).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Quantity',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.quantity).value}</div>
        <p className={handleSeparateValue(row.original.quantity).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.quantity).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Variant ID',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.variantId).value}</div>
        <p className={handleSeparateValue(row.original.variantId).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.variantId).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Front Artwork Url',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.frontArtworkUrl).value}</div>
        <p className={handleSeparateValue(row.original.frontArtworkUrl).type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.frontArtworkUrl).message}
        </p>
      </div>
    ),
  },
  {
    header: 'Back Artwork Url',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.backArtworkUrl || '').value}</div>
        <p className={handleSeparateValue(row.original.backArtworkUrl || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.backArtworkUrl || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'Mockup Url 1',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.mockupUrl1 || '').value}</div>
        <p className={handleSeparateValue(row.original.mockupUrl1 || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.mockupUrl1 || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'Label Url',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.labelUrl || '').value}</div>
        <p className={handleSeparateValue(row.original.labelUrl || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.labelUrl || '').message}
        </p>
      </div>
    ),
  },
  // {
  //   header: 'Mockup Url 2',
  //   cell: ({ row }) => (
  //     <div className={cellStyle}>
  //       <div>{handleSeparateValue(row.original.mockupUrl2 || '').value}</div>
  //       <p className={handleSeparateValue(row.original.mockupUrl2 || '').type === 'error' ? cellError : cellDetail}>
  //         {handleSeparateValue(row.original.mockupUrl2 || '').message}
  //       </p>
  //     </div>
  //   ),
  // },
  {
    header: 'Note',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.note || '').value}</div>
        <p className={handleSeparateValue(row.original.note || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.note || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'Gift Message',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.giftMessage || '').value}</div>
        <p className={handleSeparateValue(row.original.giftMessage || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.giftMessage || '').message}
        </p>
      </div>
    ),
  },
  {
    header: 'External Link',
    cell: ({ row }) => (
      <div className={cellStyle}>
        <div>{handleSeparateValue(row.original.externalLink || '').value}</div>
        <p className={handleSeparateValue(row.original.externalLink || '').type === 'error' ? cellError : cellDetail}>
          {handleSeparateValue(row.original.externalLink || '').message}
        </p>
      </div>
    ),
  },
];

const OrdersImportTable = React.memo(({ data, csvContent, hasError, resetOrder }: OrdersImportTableProps) => {
  const [pagination, setPagination] = React.useState<PaginationState>(DEFAULT_PAGINATION);

  const [searchValue, setSearchValue] = React.useState<string>('');
  const groupedData = React.useRef<OrdersImportExpenseTableDto[]>(handleConvertToIOrderTableExpenses(data));
  const [currentData, setCurrentData] = React.useState<OrdersImportExpenseTableDto[]>([]);
  function getDataByPagination(params: OrdersImportExpenseTableDto[], paginationPage: PaginationState) {
    const startIndex = (paginationPage.pageIndex - 1) * paginationPage.pageSize;
    const endIndex = startIndex + paginationPage.pageSize;

    return params.slice(startIndex, endIndex);
  }
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isImportResultDialogOpen, setIsImportResultDialogOpen] = React.useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState('');
  const [resultOrders, setResultOrders] = useState<unknown[]>([]);

  const table = useReactTable({
    data: currentData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (originalRow) => {
      return originalRow.expenses.map((expense) => ({
        externalId: '',
        shippingMethod: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        region: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        zip: '',
        note: expense.note,
        storeCode: '',
        quantity: expense.quantity,
        variantId: expense.variantId,
        frontArtworkUrl: expense.frontArtworkUrl,
        backArtworkUrl: expense.backArtworkUrl,
        mockupUrl1: expense.mockupUrl1,
        mockupUrl2: expense.mockupUrl2,
        expenses: [],
      }));
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
  });

  const isExistError: boolean = React.useMemo(() => {
    for (let i = 0; i < currentData.length; i += 1) {
      const itemKeys = Object.keys(currentData[i] || {});

      for (let j = 0; j < itemKeys.length; j += 1) {
        const itemKey = itemKeys[j] as never;
        if (
          typeof currentData[i]?.[itemKey] === 'string' &&
          handleSeparateValue(currentData[i]?.[itemKey] || '').message
        )
          return true;
      }
    }

    return false;
  }, [groupedData]);

  useEffect(() => {
    setCurrentData(getDataByPagination(groupedData.current, pagination));
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleSubmit = async () => {
    // const importData = data.map((order) => {
    //   return {
    //     ...order,
    //     variantId: order.variantId?.split('|')[0] ?? order.variantId,
    //   };
    // });

    setIsSubmitting(true);
    const importOrderResponse = await orderService.importOrders({ fileContent: csvContent });
    setIsSubmitting(false);

    if (!importOrderResponse.success || !importOrderResponse.data) {
      toast.error(importOrderResponse.message);

      return;
    }

    const orders = JSON.parse(importOrderResponse.data);
    setResultOrders(orders);

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const results: string[] = [];

    let successCount = 0;
    let errorCount = 0;
    orders.forEach((order: { externalId: string; result: string }) => {
      if (!order.result.includes('Success')) {
        results.push(`${order.externalId}: ${order.result}`);
        errorCount += 1;
      } else {
        successCount += 1;
      }
    });
    setResults(results);
    setImportSummary(`Success: ${successCount}, Error: ${errorCount}`);

    setIsImportResultDialogOpen(true);

    toast.warning('Please check import result');
  };

  return (
    <>
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={`cursor-pointer ${row.original.externalId ? 'bg-[#d7e9c3d9]' : ''}`}
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      const isSubRow = !row.original.externalId;
                      const isExternalIdCell = cell.id === `${row.id}_externalId` && !row.original.externalId;
                      const colspan = 12;

                      if (isSubRow) {
                        if (isExternalIdCell || index > colspan || index === 0) {
                          return (
                            <TableCell className="align-top" key={cell.id} colSpan={isExternalIdCell ? colspan : 1}>
                              {isExternalIdCell ? (
                                <b className="inline-block w-full italic">Save As Above</b>
                              ) : (
                                flexRender(cell.column.columnDef.cell, cell.getContext())
                              )}
                            </TableCell>
                          );
                        }

                        return null;
                      }

                      return (
                        <TableCell className="align-top" key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="m-auto max-w-[400px] animate-order-fade-in-top py-[62px] text-center">
                      <NoOrderResult className="mx-auto mb-4" />
                      <h5 className="text-xl font-bold">No orders found</h5>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          name="order"
          total={groupedData.current.length}
          pagination={pagination}
          showInputPagination={{ showInput: true, showTotalOfPage: true }}
          setPagination={setPagination}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isOffline={true}
          count={currentData.length}
        />
        <div className="mt-4 flex items-center justify-end gap-4">
          <Button variant="outline" onClick={resetOrder}>
            Cancel
          </Button>
          <Button disabled={isExistError || hasError || isSubmitting} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>

      <Dialog open={isImportResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Orders Result</DialogTitle>
            <DialogDescription>Please check carefully</DialogDescription>
          </DialogHeader>
          <p>{importSummary}</p>

          {results.map((result, index) => (
            <p className="text-warning" key={`result${index}`}>
              {result}
            </p>
          ))}

          <Button
            variant="outline"
            onClick={() => {
              // download result csv file
              if (resultOrders.length > 0) {
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(resultOrders.map((order) => toTitleCaseKey(order)));
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Result');
                const csvContent = XLSX.write(workbook, { type: 'binary', bookType: 'csv' });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'import_result.csv';
                link.click();
                URL.revokeObjectURL(url);
              }
            }}
          >
            {' '}
            Download Result CSV
          </Button>
          <DialogClose
            onClick={() => {
              setIsImportResultDialogOpen(false);
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportResultDialogOpen(false);
              }}
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { OrdersImportTable };
