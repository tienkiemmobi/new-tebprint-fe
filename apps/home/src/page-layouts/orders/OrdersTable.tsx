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
import { AlertCircle, AlertOctagon, AlertTriangle, Check, ChevronsUpDown, Copy, Dot, ShieldAlert } from 'lucide-react';
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
  Command as CommandUI,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { cn } from 'ui/lib/utils';
import { z } from 'zod';

import { RoleType } from '@/constants';
import type { Order, PackageOrderDto } from '@/interfaces';
import { orderService, updateStatus } from '@/services';
import { useAuthStore } from '@/store';

import { PackageDialog } from './PackageDialog';

type OrdersTableProps = {
  data: Order[];
  searchValue?: string;
  ordersTotal?: number;
  paramUrl: ParamUrl[];
  pagination: PaginationState;
  resetCheckBox: boolean;
  selectedOrders?: string[];
  handleSelectAllOrders: (checked: boolean) => void;
  handleClickRow: (orderId?: string) => void;
  handleSelectedOrder: (id: string) => void;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setIsParamLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setResetCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  designerEmail?: string;
  onDesignerEmailChange?: (email: string) => void;
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
  selectedOrders = [],
  handleClickRow,
  handleSelectedOrder,
  setResetCheckbox,
  designerEmail = '',
  onDesignerEmailChange,
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

  // Bulk shipment states
  const [onosSkus, setOnosSkus] = useState<
    { sku: string; name: string; id: string; weight: number; width: number; height: number; length: number }[]
  >([]);
  const [onosSkuComboboxOpen, setOnosSkuComboboxOpen] = useState(false);
  const [onosSkuValue, setOnosSkuValue] = useState('');
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isBulkShipmentLoading, setIsBulkShipmentLoading] = useState(false);

  // Assign designer states
  const [selectedDesignerEmail, setSelectedDesignerEmail] = useState('');
  const [isAssignDesignerLoading, setIsAssignDesignerLoading] = useState(false);
  const [assignDesignerResults, setAssignDesignerResults] = useState<
    { externalId: string; success: boolean; message: string }[] | null
  >(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  const DESIGNER_EMAILS = ['design1@tebprint.com', 'design2@tebprint.com', 'design3@tebprint.com'];

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
            src={
              row.original.lineItems[0]?.frontArtworkPreviewUrl
                ? row.original.lineItems[0]?.frontArtworkPreviewUrl
                : NO_IMAGE
            }
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
          {row.original.tracking?.shippingLabelUrl && (
            <p className="text-green-500">
              <a href={row.original.tracking?.shippingLabelUrl} target="_blank">
                Label Order
              </a>
            </p>
          )}
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
          <div>{row.original.store?.name}</div>
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
          <p className="truncate">{row.original.lineItems.reduce((a, b) => a + b?.quantity, 0)} Qty</p>
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
              {row.original.tracking?.shippingLabelUrl && (
                <a href={row.original.tracking.shippingLabelUrl} target="_blank">
                  <p className="text-green-500">Label Order</p>
                </a>
              )}
              {row.original.shipmentOrderId}
            </div>
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
                    : row.original.tracking?.trackingNumber}{' '}
                  {row.original.tracking?.carrierCode}
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
            <p className="truncate">{row.original.designer?.email}</p>
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

  // Fetch Onos products for bulk shipment
  useEffect(() => {
    if (![RoleType.ADMIN, RoleType.WAREHOUSE].includes(user?.role)) {
      return;
    }

    const fetchOnosProducts = async () => {
      const data = await orderService.getOnosProducts();
      if (!data.success || !data.data) {
        toast.error(data.message);

        return;
      }

      setOnosSkus(data.data);
    };

    fetchOnosProducts();
  }, [user?.role]);

  const handleBulkCreateShipment = async (
    packageData: PackageOrderDto & { onosProductId?: string; onosProductSku?: string; onosProductName?: string },
  ) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');

      return;
    }

    if (!packageData.onosProductId || !packageData.onosProductSku || !packageData.onosProductName) {
      toast.error('Please select an Onos SKU');

      return;
    }

    try {
      setIsBulkShipmentLoading(true);
      const response = await orderService.bulkCreateShipment(selectedOrders, {
        onosProductId: packageData.onosProductId,
        onosProductSku: packageData.onosProductSku,
        onosProductName: packageData.onosProductName,
        weight: packageData.weight,
        width: packageData.width,
        height: packageData.height,
        length: packageData.length,
        skipAddressCheck: packageData.skipAddressCheck,
        service: packageData.service,
        scan: packageData.scan,
      });

      if (response.success) {
        toast.success(`Bulk shipment created for ${selectedOrders.length} order(s)`);
        setIsPackageDialogOpen(false);
        setOnosSkuValue('');
        // Clear selections
        handleSelectAllOrders(false);
      } else {
        toast.error(response.message || 'Failed to create bulk shipment');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create bulk shipment');
    } finally {
      setIsBulkShipmentLoading(false);
    }
  };

  const handleAssignDesigner = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');

      return;
    }

    if (!selectedDesignerEmail) {
      toast.error('Please select a designer');

      return;
    }

    try {
      setIsAssignDesignerLoading(true);
      const response = await orderService.assignDesigner(selectedOrders, selectedDesignerEmail);

      if (response.success && response.data?.results) {
        setAssignDesignerResults(response.data.results);
        setIsResultsDialogOpen(true);
        // Clear selections after successful assignment
        const hasAnySuccess = response.data.results.some((r) => r.success);
        if (hasAnySuccess) {
          handleSelectAllOrders(false);
          setSelectedDesignerEmail('');
        }
      } else {
        toast.error(response.message || 'Failed to assign designer');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to assign designer');
    } finally {
      setIsAssignDesignerLoading(false);
    }
  };

  const hasSelectedOrders = selectedOrders.length > 0;
  const showBulkShipmentUI =
    hasSelectedOrders && user?.role && [RoleType.ADMIN, RoleType.WAREHOUSE].includes(user.role);
  const showAssignDesignerUI =
    hasSelectedOrders && user?.role && [RoleType.ADMIN, RoleType.MANAGER, RoleType.WAREHOUSE].includes(user.role);
  const showDesignerFilter = user?.role && [RoleType.ADMIN, RoleType.WAREHOUSE, RoleType.MANAGER].includes(user.role);

  return (
    <>
      <div className="w-full">
        {showDesignerFilter && (
          <div className="mb-4 flex items-center gap-4 rounded-md border bg-gray-50 p-4">
            <div className="flex-1">
              <Select
                value={designerEmail || 'all'}
                onValueChange={(value) => {
                  if (onDesignerEmailChange) {
                    onDesignerEmailChange(value === 'all' ? '' : value);
                  }
                }}
              >
                <SelectTrigger className="w-full max-w-[300px]">
                  <SelectValue placeholder="Filter by Designer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designers</SelectItem>
                  {DESIGNER_EMAILS.map((email) => (
                    <SelectItem key={`filter-designer-${email}`} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {(showBulkShipmentUI || showAssignDesignerUI) && (
          <div className="mb-4 space-y-3 rounded-md border bg-gray-50 p-4">
            {showBulkShipmentUI && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Popover open={onosSkuComboboxOpen} onOpenChange={setOnosSkuComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={onosSkuComboboxOpen}
                        className="w-full justify-between"
                      >
                        {onosSkuValue.split('-')[0]?.trim() || 'Select Onos SKU...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <CommandUI>
                        <CommandInput placeholder="Select Onos SKU..." />
                        <CommandEmpty>No SKU found.</CommandEmpty>
                        <CommandGroup className="h-[300px] overflow-y-scroll">
                          {onosSkus.map((sku) => (
                            <CommandItem
                              key={sku.sku}
                              value={`${sku.sku} - ${sku.name}`}
                              onSelect={(currentValue) => {
                                setOnosSkuValue(currentValue);
                                setOnosSkuComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  onosSkuValue.split('-')[0]?.trim() === sku.sku ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {`${sku.sku} - ${sku.name} (${sku.weight}g - ${sku.width} - ${sku.height} - ${sku.length})`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandUI>
                    </PopoverContent>
                  </Popover>
                </div>
                <PackageDialog
                  open={isPackageDialogOpen}
                  onOpenChange={setIsPackageDialogOpen}
                  onosSkus={onosSkus}
                  onosSkuValue={onosSkuValue}
                  onOnosSkuChange={setOnosSkuValue}
                  onSubmit={handleBulkCreateShipment}
                  isLoading={isBulkShipmentLoading}
                  trigger={
                    <Button
                      className="rounded-[5px] border bg-green-500 p-2 text-base text-white hover:bg-green-700 hover:text-white disabled:opacity-60"
                      disabled={!onosSkuValue}
                    >
                      Package
                    </Button>
                  }
                  title={`Package ${selectedOrders.length} Order${selectedOrders.length > 1 ? 's' : ''}`}
                />
                <div className="text-sm text-gray-600">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </div>
              </div>
            )}
            {showAssignDesignerUI && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Select value={selectedDesignerEmail} onValueChange={setSelectedDesignerEmail}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Designer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNER_EMAILS.map((email) => (
                        <SelectItem key={`designer-${email}`} value={email}>
                          {email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="rounded-[5px] border bg-blue-500 p-2 text-base text-white hover:bg-blue-700 hover:text-white disabled:opacity-60"
                  onClick={handleAssignDesigner}
                  disabled={!selectedDesignerEmail || isAssignDesignerLoading}
                >
                  {isAssignDesignerLoading ? 'Assigning...' : 'Assign Designer'}
                </Button>
                {!showBulkShipmentUI && (
                  <div className="text-sm text-gray-600">
                    {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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

      {/* Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Results</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto py-4">
            {assignDesignerResults && assignDesignerResults.length > 0 ? (
              <div className="space-y-2">
                {assignDesignerResults.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded-md border p-3 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                          {result.externalId}
                        </p>
                        <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.message}
                        </p>
                      </div>
                      {result.success ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No results available</p>
            )}
          </div>
          <DialogFooter>
            <Button
              className="rounded-[3px] bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => {
                setIsResultsDialogOpen(false);
                setAssignDesignerResults(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { OrdersTable };
