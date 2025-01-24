import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { AlertCircle, AlertOctagon, AlertTriangle, Copy, Dot, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { NO_IMAGE } from 'shared';
import type { ParamUrl } from 'ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Checkbox,
  CustomTooltip,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  NoOrderResult,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';
import { z } from 'zod';

import { RoleType } from '@/constants';
import type { Order } from '@/interfaces';
import { orderService, updateStatus } from '@/services';
import { useAuthStore } from '@/store';

type OrdersTableProps = {
  data: Order[];
  searchValue?: string;
  ordersTotal?: number;
  paramUrl: ParamUrl[];
  pagination: PaginationState;
  resetCheckBox: boolean;
  handleSelectAllOrders: (checked: boolean) => void;
  handleClickRow: (orderId?: string) => void;
  handleSelectedOrder: (id: string) => void;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setIsParamLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setResetCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
};

type OrderStatus = {
  name: string;
  color: string;
};

const OrderStatusName: Record<string, OrderStatus> = {
  no_artwork: { name: 'No artwork', color: '#FF5733' },
  pending: { name: 'Pending', color: '#FFA500' },
  processing: { name: 'Processing', color: '#FFFF00' },

  on_hold: { name: 'On hold', color: '#8B0000' },
  in_production: { name: 'In production', color: '#008000' },
  produced: { name: 'Produced', color: '#0000FF' },
  partially_produced: { name: 'Partially Produced', color: '#FFA500' },
  packaged: { name: 'Packaged', color: '#ADD8E6' },
  labeled: { name: 'Labeled', color: '#0000FF' },
  in_transit: { name: 'In Transit', color: '#800080' },
  // partially_delivered: { name: 'Partially delivered', color: '#FF1493' },
  delivered: { name: 'Delivered', color: '#008080' },
  done: { name: 'Done', color: '#808080' },
  cancelled: { name: 'Cancelled', color: '#FF5733' },
  refunded: { name: 'Refunded', color: '#ADD8E6' },
  // returned: { name: 'Returned', color: '#8B0000' },
  artwork_error: { name: 'Artwork error', color: 'red' },
};

function OrdersTable({
  data,
  paramUrl,
  pagination,
  searchValue,
  ordersTotal,
  setPagination,
  setIsParamLoaded,
  setSearchValue,
  handleSelectAllOrders,
  resetCheckBox,
  handleClickRow,
  handleSelectedOrder,
  setResetCheckbox,
}: OrdersTableProps) {
  const { user } = useAuthStore.getState();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [onDialogRow, setOnDialogRow] = useState<Order | null>(null);
  const [dialogAction, setDialogAction] = useState('');

  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const updateStatusForm = useForm({
    resolver: zodResolver(z.object({ status: z.string() })),
    defaultValues: {
      status: 'done',
    },
    mode: 'all',
  });

  const onDialogConfirm = async () => {
    if (!onDialogRow) {
      toast.error('No order selected');

      return;
    }

    if (dialogAction === 'delete') {
      const response = await orderService.deleteOrder(onDialogRow?._id);

      if (response?.success) {
        setIsConfirmDialogOpen(false);

        toast.success('Delete order successfully');
      } else {
        toast.error(response?.message);
      }
    } else if (dialogAction === 'cancel') {
      const response = await orderService.cancelOrder(onDialogRow?._id);

      if (response?.success) {
        setIsConfirmDialogOpen(false);

        toast.success('Cancel order successfully');
      } else {
        toast.error(response?.message);
      }
    } else {
      toast.error('Unsupported dialog action');
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex w-10 items-center justify-center">
          <Checkbox
            className="h-6 w-6"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              handleSelectAllOrders(!!value);
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex w-10 items-center justify-center">
          <Checkbox
            className="h-6 w-6"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              handleSelectedOrder(row.original._id);
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'preview',
      header: 'Preview',
      cell: ({ row }) => (
        <a target="_blank" href={`/orders/${row.original._id}`} onClick={(e) => e.stopPropagation()}>
          <img
            // crossorigin="anonymous"
            width="168"
            height="168"
            // src={row.original.tempFrontArtworkUrl ? row.original.tempFrontArtworkUrl : NO_IMAGE}
            src={row.original.lineItems[0]?.frontArtwork ? row.original.lineItems[0]?.frontArtwork : NO_IMAGE}
          />
        </a>
      ),
    },
    {
      header: 'Order ID',
      cell: ({ row }) => (
        <div className="w-[160px]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold" order-external-id="true">
              <Copy
                className="mr-1 inline"
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(row.original.externalId);
                }}
              ></Copy>
              <span
                className="cursor-pointer hover:bg-primary hover:text-white"
                onClick={() => {
                  handleClickRow(row.original._id);
                }}
              >
                {row.original.externalId}
              </span>
            </p>
            {row.original.sellerNote && (
              <CustomTooltip
                tooltipTrigger={<AlertCircle className="h-4 w-4 text-primary" />}
                tooltipContent={<p>Seller Note: {row.original.sellerNote}</p>}
                delayDuration={200}
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-warning/80">{row.original.name}</p>
            {row.original.systemNote && (
              <CustomTooltip
                tooltipTrigger={<AlertTriangle className="h-4 w-4 text-primary" />}
                tooltipContent={<p>System Note: {row.original.systemNote}</p>}
                delayDuration={200}
              />
            )}
          </div>
          <div>{row.original.store.name}</div>
          <div>
            {row.original.privateNote && (
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-destructive">{row.original.privateNote}</span>
                <CustomTooltip
                  tooltipTrigger={<ShieldAlert className="inline h-4 w-4 text-destructive" />}
                  tooltipContent={<p>Private Note: {row.original.privateNote}</p>}
                  delayDuration={200}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div title="Order is importing">{row.original.isImporting && <span className="dsy-loading h-4 w-4" />}</div>
            {row.original.importError && (
              <CustomTooltip
                tooltipTrigger={<AlertOctagon className="h-4 w-4 text-[red]" />}
                tooltipContent={<p className="text-[red]">Import Error: {row.original.importError}</p>}
                delayDuration={200}
              />
            )}
          </div>
        </div>
      ),
    },
    // {
    //   header: 'Type',
    //   cell: ({ row }) => (
    //     <div>
    //       <p className="truncate capitalize">{row.original.type}</p>
    //     </div>
    //   ),
    // },
    {
      header: 'Items',
      cell: ({ row }) => (
        <div>
          <p className="truncate">{row.original.lineItems.length} Items</p>
          <p className="truncate">{row.original.lineItems.reduce((a, b) => a + b.quantity, 0)} Qty</p>
        </div>
      ),
    },
    {
      header: 'Paid',
      cell: ({ row }) => {
        return (
          <>
            <p>${row.original.total}</p>
            <p>
              {row.original.isPaid ? <span className="text-success">Yes</span> : <span className="text-error">No</span>}
            </p>
          </>
        );
      },
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        return (
          <div className="flex">
            <Dot color={OrderStatusName[row.original.status]?.color || '#000000'} strokeWidth={10} fill="#e61919" />
            <div className="w-20">
              <div>{OrderStatusName[row.original.status]?.name || row.original.status}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Shipment',
      cell: ({ row }) => {
        return (
          <div className="w-[140px]">
            <p className="truncate">{`${row.original.shippingAddress.firstName || ''} ${
              row.original.shippingAddress.lastName || ''
            }`}</p>
            <div>
              {row.original.shipmentOrderId && (
                <Copy
                  className="mr-1 inline"
                  size={10}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(row.original.shipmentOrderId);
                  }}
                ></Copy>
              )}
              {row.original.shipmentOrderId}
            </div>
            <div>{row.original.shipmentOrderStatus}</div>
            <div>
              {row.original.tracking && row.original.tracking.trackingNumber && (
                <Copy
                  className="mr-1 inline"
                  size={10}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(row.original.tracking.trackingNumber);
                  }}
                ></Copy>
              )}
              {row.original.tracking && (
                <a
                  className="dsy-link dsy-link-primary"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  href={`https://t.17track.net/en?nums=${row.original.tracking.trackingNumber}`}
                >
                  {row.original.tracking?.trackingNumber?.length && row.original.tracking?.trackingNumber?.length >= 8
                    ? `...${row.original.tracking?.trackingNumber?.slice(-8)}`
                    : row.original.tracking?.trackingNumber}
                </a>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Created',
      cell: ({ row }) => {
        return (
          <div className="w-[160px] truncate">
            <p className="mb-1">{format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            <p className="truncate text-warning">{row.original.user?.fullName}</p>
            <p className="truncate">{row.original.user?.email}</p>

            <p className="truncate">Designer:{row.original.designerName}</p>
          </div>
        );
      },
    },
    {
      header: 'Product',
      cell: ({ row }) => (
        <div className="w-[140px]">
          <div className="truncate" title={row.original.lineItems[0]?.productTitle}>
            {row.original.lineItems[0]?.productTitle}
          </div>
          <div
            className="truncate text-warning"
            title={`${row.original.lineItems[0]?.variantSize}/${row.original.lineItems[0]?.variantColor}/${row.original.lineItems[0]?.variantStyle}`}
          >
            {row.original.lineItems[0]?.variantSize} / {row.original.lineItems[0]?.variantColor} /{' '}
            {row.original.lineItems[0]?.variantStyle}
          </div>
        </div>
      ),
    },
    {
      header: 'Updated',
      cell: ({ row }) => {
        const { updatedAt } = row.original;

        return (
          <div>
            <p>{format(new Date(updatedAt), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="flex w-10 items-center justify-center">
            <AlertDialog open={isConfirmDialogOpen}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={row.original.status !== 'pending'}>
                    <AlertDialogTrigger
                      onClick={() => {
                        setOnDialogRow(row.original);
                        setDialogAction('pay');
                      }}
                      className="w-full text-left"
                    >
                      Pay
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={user?.role !== RoleType.ADMIN && row.original.isPaid}
                  >
                    <AlertDialogTrigger
                      onClick={() => {
                        setIsConfirmDialogOpen(true);
                        setOnDialogRow(row.original);
                        setDialogAction('cancel');
                      }}
                      className="w-full text-left"
                    >
                      Cancel
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                  {user?.role === RoleType.ADMIN && (
                    <>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <AlertDialogTrigger
                          onClick={() => {
                            setIsConfirmDialogOpen(true);
                            setOnDialogRow(row.original);
                            setDialogAction('delete');
                          }}
                          className="w-full text-left"
                        >
                          Delete
                        </AlertDialogTrigger>
                      </DropdownMenuItem>

                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <button
                          type="button"
                          onClick={() => {
                            setOnDialogRow(row.original);
                            setIsUpdateStatusDialogOpen(true);
                          }}
                          className="w-full text-left"
                        >
                          Update Status
                        </button>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this order from our system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDialogConfirm()}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: 10,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  useEffect(() => {
    if (resetCheckBox) {
      table.toggleAllPageRowsSelected(false);
      setResetCheckbox(false);
    }
  }, [resetCheckBox]);

  return (
    <>
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        className={`${
                          index === headerGroup.headers.length - 1
                            ? 'right-0 z-20 w-10 bg-white p-2 text-center text-black shadow-[0.25em_0.25em_0.25em_0.25em_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        } ${
                          index === 0
                            ? 'left-0 z-20 w-10 bg-white pl-1 text-black shadow-[0.25em_0.25em_0_0.25em_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        } ${
                          false && index === headerGroup.headers.length - 1
                            ? 'right-[56px] z-20 w-10 bg-white p-2 text-center text-black shadow-[0.25em_0.25em_0.25em_0.25em_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        }`}
                        key={header.id}
                      >
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
                    className="cursor-pointer"
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    // onClick={(e) => {
                    //   if (
                    //     (e.target as HTMLElement).tagName === 'BUTTON' ||
                    //     (e.target as HTMLElement).nodeName === 'BUTTON' ||
                    //     (e.target as HTMLElement).localName === 'svg' ||
                    //     (e.target as HTMLElement).localName === 'path'
                    //   ) {
                    //     e.preventDefault();

                    //     return;
                    //   }
                    //   handleClickRow(row.original._id);
                    // }}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        className={`${
                          index === row.getVisibleCells().length - 1
                            ? 'right-0 z-20 w-10 bg-white p-2 shadow-[0.25em_0.25em_0.25em_0_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        }${
                          index === 0
                            ? 'left-0 z-20 w-10 bg-white pl-1 text-white shadow-[0.25em_0.25em_0_0.25em_0_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        }${
                          index === row.getVisibleCells().length - 1
                            ? 'right-[56px] z-20 w-10 bg-white p-2 text-black shadow-[0.25em_0.25em_0_0.25em_0_rgba(0,0,0,0.4)] drop-shadow md:sticky'
                            : ''
                        }`}
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
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
          name="orders"
          paramUrl={paramUrl}
          count={data.length}
          pagination={pagination}
          total={ordersTotal || 0}
          searchValue={searchValue}
          setPagination={setPagination}
          setSearchValue={setSearchValue}
          setIsParamLoaded={setIsParamLoaded}
          showInputPagination={{ showInput: true, showTotalOfPage: true }}
        />
      </div>
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <Form {...updateStatusForm}>
            <div className="grid gap-4 py-4">
              <FormField
                control={updateStatusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Status</FormLabel>
                      <Select required={true} onValueChange={field.onChange} defaultValue="done">
                        <FormControl className="col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['done'].map((status, index) => {
                            return (
                              <SelectItem key={`order-status-${status}${index}`} value={status}>
                                {status}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right"></FormLabel>
                      <FormMessage className="col-span-3" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                onClick={async () => {
                  console.log(updateStatusForm.getValues());
                  try {
                    if (!updateStatusForm.getValues('status')) {
                      throw new Error('Please select a status');
                    }

                    if (!onDialogRow?._id) {
                      throw new Error('Please select an order');
                    }

                    const resp = await updateStatus(onDialogRow?._id, updateStatusForm.getValues('status'));
                    if (resp.success) {
                      toast.success('Update status success');
                      setOnDialogRow(null);
                      setIsUpdateStatusDialogOpen(false);
                    } else {
                      toast.error(`Failed to update status - ${resp.message}`);
                    }
                  } catch (error) {
                    console.log(error);
                    toast.error(`Failed to update status - ${(error as Error).message}`);
                  }
                }}
              >
                Submit
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { OrdersTable };
