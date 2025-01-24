/* eslint-disable unused-imports/no-unused-vars */
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { ArrowLeft, Check, ChevronsUpDown, Download, Pencil } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { NoteType } from 'shared';
import type { CustomDropdownMenuProps } from 'ui';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CustomDropdownMenu,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SvgBarcode,
  TebToastContainer,
  Textarea,
} from 'ui';
import { cn } from 'ui/lib/utils';
import { ZodError } from 'zod';

import { RoleType } from '@/constants';
import type { CancelReasonDto, LineItem, Order, OrderIssueDto, PackageOrderDto } from '@/interfaces';
import { CancelReasonZodSchema, OrderIssueZodSchema, PackageOrderZodSchema } from '@/interfaces';
import { orderService } from '@/services';
import { useAuthStore } from '@/store';

import { EditShippingAddressDialog, type EditShippingAddressDialogRef } from './EditShippingAddressDialog';
import { OrderDetailLineItem } from './OrderDetailLineItem';
import type { OrderNoteDialogRef } from './OrderNoteDialog';
import { OrderNoteDialog } from './OrderNoteDialog';

type OrderDetailProps = {
  orderId: string;
  onBackClick: (orderId?: string) => void;
  handlePopstate: (event: PopStateEvent) => void;
};

export type OrderDetailState = {
  state: 'PENDING' | 'SUCCESS' | 'REJECTED';
  order: Order;
  noteType?: NoteType;
  lineItemIdForNote?: string;
};

const downloadDropdown: CustomDropdownMenuProps = {
  menuTrigger: (
    <button className="flex items-center justify-center gap-2">
      <Download className="ml-2 h-4 w-4" /> <span>Download</span>
    </button>
  ),
  menuGroup: [
    {
      group: [
        {
          element: <div className="cursor-pointer">Invoice _id..</div>,
        },
        {
          element: <div className="cursor-pointer">Go to all invoices</div>,
        },
      ],
    },
  ],
};

const CancellationReasons = [
  'Out of stock',
  'Customer changed their mind',
  'Incorrect address',
  'Payment issues',
  'Item not as described',
  'Shipping delay',
  'Unforeseen circumstances',
];

const OrderIssues = [
  'Wrong design',
  'Wrong cutting',
  'Wrong personalization',
  'Poor print quality',
  'Poor cutting quality',
  'Broken item',
  'Other',
];

const initOrderDetailState: OrderDetailState = {
  state: 'PENDING',
  order: {
    _id: '',
    externalId: '',
    name: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      zip: '',
      region: '',
      country: '',
    },
    shippingMethod: '',
    type: '',
    store: '',
    user: '',
    status: '',
    priority: 0,
    shippingEvents: [],
    shippingStatus: '',
    tracking: {},
    logs: [],
    lineItems: [],
    isPaid: false,
    createdAt: '',
    updatedAt: '',
  },
};

const OrderDetail = ({ orderId, onBackClick, handlePopstate }: OrderDetailProps) => {
  const { user } = useAuthStore.getState();

  const dialogOrderNoteRef = useRef<OrderNoteDialogRef>(null);
  const editShippingAddressDialogRef = useRef<EditShippingAddressDialogRef>(null);

  const [orderDetailState, setOrderDetailState] = useState<OrderDetailState>(initOrderDetailState);

  const [onosSkus, setOnosSkus] = useState<
    { sku: string; name: string; id: string; weight: number; width: number; height: number; length: number }[]
  >([]);
  const [onosSkuComboboxOpen, setOnosSkuComboboxOpen] = useState(false);
  const [onosSkuValue, setOnosSkuValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shippingServices = [
    {
      id: 1,
      name: 'OnosExpress',
    },
    {
      id: 2,
      name: 'AnanBay',
    },
    {
      id: 3,
      name: 'NSLog',
    },
  ];

  const tebPackages = [
    {
      id: '1',
      name: '11x10x2 (50g)',
      weight: 50,
      width: 11,
      height: 10,
      length: 2,
    },
    {
      id: '2',
      name: '14x14x3 (100g)',
      weight: 100,
      width: 14,
      height: 14,
      length: 3,
    },
    {
      id: '3',
      name: '17x17x3 (150g)',
      weight: 150,
      width: 17,
      height: 17,
      length: 3,
    },
    {
      id: '4',
      name: '21x21x2 (180g)',
      weight: 180,
      width: 21,
      height: 21,
      length: 2,
    },
    {
      id: '5',
      name: '27x21x1.5 (250g)',
      weight: 250,
      width: 27,
      height: 21,
      length: 1.5,
    },
  ];

  // const [currentTebPackage, setCurrentTebPackage] = useState<(typeof tebPackages)[number] | null>(null);

  const noteValue = useMemo(() => {
    if (!orderDetailState.noteType) return '';

    if (orderDetailState.lineItemIdForNote) {
      if (orderDetailState.noteType === 'seller-note')
        return orderDetailState.order.lineItems.find((item) => item._id === orderDetailState.lineItemIdForNote)
          ?.sellerNote;

      return orderDetailState.order.lineItems.find((item) => item._id === orderDetailState.lineItemIdForNote)
        ?.systemNote;
    }

    if (orderDetailState.noteType === 'seller-note') return orderDetailState.order.sellerNote;

    return orderDetailState.order.systemNote;
  }, [orderDetailState.noteType, orderDetailState.lineItemIdForNote, orderDetailState.order]);

  // const defaultValuesReturn: ReturnReasonDto = {
  //   orderReturnReasons: '',
  //   description: '',
  // };

  const defaultValuesCancel: CancelReasonDto = {
    orderCancellationReasons: '',
    description: '',
  };

  const issueOrderDefaultFormValues: OrderIssueDto = {
    issue: '',
    description: '',
  };

  const packageOrderDefaultValues: PackageOrderDto = {
    service: 'AnanBay',
    packageId: '',
    weight: 12,
    width: 12,
    height: 12,
    length: 12,
    skipAddressCheck: false,
    scan: false,
  };

  const cancelOrderForm = useForm({
    resolver: zodResolver(CancelReasonZodSchema),
    defaultValues: defaultValuesCancel,
    mode: 'all',
  });

  const issueOrderForm = useForm<OrderIssueDto>({
    resolver: zodResolver(OrderIssueZodSchema),
    defaultValues: issueOrderDefaultFormValues,
    mode: 'all',
  });

  const packageOrderForm = useForm<PackageOrderDto>({
    resolver: zodResolver(OrderIssueZodSchema),
    defaultValues: packageOrderDefaultValues,
    mode: 'all',
  });

  const onSubmitCancel = async (data: CancelReasonDto) => {
    const OrderId = orderDetailState.order._id as string;
    const cancelOrderResponse = await orderService.putCancelOrder(data, OrderId);

    if (!cancelOrderResponse.success || !cancelOrderResponse.data) {
      toast.error(cancelOrderResponse.message);

      return;
    }

    cancelOrderForm.reset();
    toast.success(cancelOrderResponse.message);
  };
  // const onSubmitRefund = async (data: ReturnReasonDto) => {
  //   const OrderId = orderDetailState.order?._id as string;
  //   const refundOrderResponse = await orderService.putRefundOrder(data, OrderId);

  //   if (!refundOrderResponse.success || !refundOrderResponse.data) {
  //     toast.error(refundOrderResponse.message);

  //     return;
  //   }

  //   returnOrderForm.reset();
  //   toast.success(refundOrderResponse.message);
  // };

  const onSubmitIssue = async (data: OrderIssueDto) => {
    const currentOrderId = orderDetailState.order?._id as string;
    const response = await orderService.issueOrder(data, currentOrderId);

    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }

    issueOrderForm.reset();
    toast.success(response.message);
  };

  const handleCreateShipmentOrder = async (data: {
    weight: number;
    width: number;
    height: number;
    length: number;
    skipAddressCheck: boolean;
    service: string;
    scan?: boolean;
  }) => {
    try {
      setIsLoading(true);
      const currentOrderId = orderDetailState.order?._id as string;
      const onosSku = onosSkus.find((myOnosSku) => myOnosSku.sku.toLowerCase() === onosSkuValue.split('-')[0]?.trim());
      const response = await orderService.createShipmentOrder(currentOrderId, {
        ...data,
        onosProductId: onosSku!.id,
        onosProductSku: onosSku!.sku,
        onosProductName: onosSku!.name,
      });

      if (!response.success || !response.data) {
        toast.error(response.message);

        return;
      }

      toast.success(response.message);

      setOrderDetailState((prev) => ({
        ...prev,
        order: {
          ...prev.order,
          shipmentOrderId: response.data.shipmentOrderId,
          shipmentOrderCost: response.data.shipmentOrderCost,
          shipmentOrderStatus: response.data.shipmentOrderStatus,
          tracking: {
            ...prev.order.tracking,
            trackingNumber: response.data.tracking.trackingNumber,
          },
        },
      }));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetProducedStatus = async () => {
    const currentOrderId = orderDetailState.order?._id as string;
    const response = await orderService.updateStatus(currentOrderId, 'produced');

    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }

    toast.success(response.message);
  };

  // function base64ToBlob(base64: string, mimeType: string) {
  //   const byteCharacters = atob(base64.split(',')[1]!);
  //   const byteNumbers = new Array(byteCharacters.length);

  //   // eslint-disable-next-line no-plusplus
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }

  //   const byteArray = new Uint8Array(byteNumbers);

  //   return new Blob([byteArray], { type: mimeType });
  // }

  const openPrintWindow = (imgData: string) => {
    // eslint-disable-next-line new-cap
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'JPEG', 10, 10, 190, 0);
    const pdfOutput = pdf.output('blob');
    const url = URL.createObjectURL(pdfOutput);

    const pdfWindow = window.open(url, '_blank');
    if (pdfWindow) {
      pdfWindow.onload = () => {
        pdfWindow.print();
      };
    }
  };

  const printLabel = async () => {
    const currentOrderId = orderDetailState.order?._id as string;
    const response = await orderService.printLabel(currentOrderId);

    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }

    const labelUrl = response.data;

    if (labelUrl.startsWith('data')) {
      openPrintWindow(labelUrl);
    } else {
      const newWindow = window.open(labelUrl);
      newWindow!.onload = function () {
        newWindow?.print();
        setTimeout(() => {
          newWindow?.print();
        }, 1000);
      };
    }

    // printPDF('https://dt5ymcp9sajok.cloudfront.net/labels/07-24-11069222/1720726424.pdf');
  };

  useEffect(() => {
    const hrefUrl = window.location.href;
    const queryString = window.location.search;
    const parts = hrefUrl.split('/');
    const desiredPart = parts[parts.length - 1];

    if (desiredPart === 'orders' || queryString) {
      const newUrl = `${window.location.pathname}/${orderId}`;
      window.history.pushState({ pwOrderId: orderId }, '', newUrl);
    } else {
      const newUrl = `${window.location.href}`;
      window.history.pushState({ pwOrderId: orderId }, '', newUrl);
    }
    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.history.replaceState(null, '', '/orders');
    };
  }, []);

  useEffect(() => {
    const fetchOrderById = async () => {
      if (!orderId) {
        return;
      }
      const response = await orderService.getOrderById(orderId);
      if (!response.success || !response.data) {
        toast.error(response.message);

        return;
      }
      setOrderDetailState((prev) => ({
        ...prev,
        state: 'SUCCESS',
        order: response.data as Order,
      }));
    };
    fetchOrderById();
  }, [orderId]);

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
  }, []);

  useEffect(() => {
    if (!onosSkuValue) {
      return;
    }
    const onosSku = onosSkus.find((myOnosSku) => myOnosSku.sku.toLowerCase() === onosSkuValue.split('-')[0]?.trim());

    packageOrderForm.setValue('weight', onosSku?.weight || 0);
    packageOrderForm.setValue('height', onosSku?.height || 0);
    packageOrderForm.setValue('width', onosSku?.width || 0);
    packageOrderForm.setValue('length', onosSku?.length || 0);
  }, [onosSkuValue]);

  useEffect(() => {
    const currentPackage = tebPackages.find((myPackage) => myPackage.id === packageOrderForm.watch('packageId'));

    if (!currentPackage) {
      return;
    }

    packageOrderForm.setValue('weight', currentPackage!.weight);
    packageOrderForm.setValue('height', currentPackage!.height);
    packageOrderForm.setValue('width', currentPackage!.width);
    packageOrderForm.setValue('length', currentPackage!.length);
    // @ts-expect-error packageId
  }, packageOrderForm.watch('packageId'));

  return (
    <>
      <div className="my-1 flex cursor-pointer items-center gap-1" onClick={() => onBackClick()}>
        <ArrowLeft />
        <span className="text-lg">Back</span>
      </div>
      {orderDetailState.state === 'PENDING' ? (
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <span className="dsy-loading dsy-loading-spinner dsy-loading-lg"></span>
        </div>
      ) : (
        <>
          {orderDetailState.order && (
            <>
              <div className="mb-8">
                <div>
                  <h2 className="w-fit text-3xl font-bold">
                    {orderDetailState.order.externalId}
                    {` - `} {orderDetailState.order.name} (
                    <span className="capitalize">{orderDetailState.order.type}</span>)
                  </h2>
                  {/* Issue Dialog */}
                  <Dialog>
                    <DialogTrigger className="inline rounded-[5px] border bg-red-500 p-2 text-base text-white hover:bg-red-700 hover:text-white disabled:opacity-60">
                      Issue
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Issue Order</DialogTitle>
                      </DialogHeader>
                      <Form {...issueOrderForm}>
                        <div className="grid gap-4 py-4">
                          <FormField
                            control={issueOrderForm.control}
                            name="issue"
                            render={({ field }) => (
                              <FormItem>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <FormLabel className="text-right">Reason</FormLabel>
                                  <Select required={true} onValueChange={field.onChange}>
                                    <FormControl className="col-span-3">
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {OrderIssues.map((reason, index) => {
                                        return (
                                          <SelectItem key={`${reason}${index}`} value={reason}>
                                            {reason}
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
                          <FormField
                            control={issueOrderForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <FormLabel className="col-span-1 text-right">Description</FormLabel>
                                  <FormControl className="col-span-3">
                                    <Textarea
                                      required={true}
                                      placeholder="Description"
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
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
                            onClick={() => {
                              if (!issueOrderForm.getValues().issue || !issueOrderForm.getValues().description) {
                                return;
                              }

                              onSubmitIssue(issueOrderForm.getValues());
                            }}
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  {[RoleType.ADMIN, RoleType.WAREHOUSE].includes(user?.role) && (
                    <>
                      <Button
                        className="ml-4"
                        onClick={() => {
                          handleSetProducedStatus();
                        }}
                      >
                        Produced
                      </Button>

                      <div className="ml-4 inline">
                        <Popover open={onosSkuComboboxOpen} onOpenChange={setOnosSkuComboboxOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={onosSkuComboboxOpen}
                              className="w-[400px] justify-between"
                            >
                              {onosSkuValue.split('-')[0]?.trim() || 'Select Onos SKU...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[600px] p-0">
                            <Command>
                              <CommandInput placeholder="Select Onos SKU..." />
                              <CommandEmpty>No framework found.</CommandEmpty>
                              <CommandGroup className="h-[500px] overflow-y-scroll">
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
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Package Dialog */}
                      <Dialog
                        onOpenChange={() => {
                          packageOrderForm.setValue('skipAddressCheck', false);
                        }}
                      >
                        <DialogTrigger className="ml-4 inline rounded-[5px] border bg-green-500 p-2 text-base text-white hover:bg-green-700 hover:text-white disabled:opacity-60">
                          Package
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Package Order</DialogTitle>
                          </DialogHeader>
                          <Form {...packageOrderForm}>
                            <div className="grid gap-4 py-4">
                              <FormField
                                // control={packageOrderForm.control}
                                name="service"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right">Service</FormLabel>
                                      <Select defaultValue="AnanBay" required={true} onValueChange={field.onChange}>
                                        <FormControl className="col-span-3">
                                          <SelectTrigger>
                                            <SelectValue placeholder="Package" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {shippingServices.map((service, index) => {
                                            return (
                                              <SelectItem key={`${service.id}`} value={service.name}>
                                                {service.name}
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
                              <FormField
                                // control={packageOrderForm.control}
                                name="packageId"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right">Package</FormLabel>
                                      <Select required={true} onValueChange={field.onChange}>
                                        <FormControl className="col-span-3">
                                          <SelectTrigger>
                                            <SelectValue placeholder="Package" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {tebPackages.map((tebPackage, index) => {
                                            return (
                                              <SelectItem key={`${tebPackage.id}`} value={tebPackage.id}>
                                                {tebPackage.name}
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
                              <FormField
                                control={packageOrderForm.control}
                                name="weight"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Weight</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          type="text"
                                          required={true}
                                          placeholder="Weight"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={packageOrderForm.control}
                                name="width"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Width</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          type="text"
                                          required={true}
                                          placeholder="Width"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={packageOrderForm.control}
                                name="height"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Height</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          type="text"
                                          required={true}
                                          placeholder="Height"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={packageOrderForm.control}
                                name="length"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Length</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          type="text"
                                          required={true}
                                          placeholder="Length"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={packageOrderForm.control}
                                name="skipAddressCheck"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Skip Address Check</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          onChange={(e) => {
                                            field.onChange(e);
                                          }}
                                          checked={field.value}
                                          type="checkbox"
                                          required={true}
                                          className="resize-none"
                                          // {...field}
                                        />
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={packageOrderForm.control}
                                name="scan"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Scan?</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Input
                                          onChange={(e) => {
                                            field.onChange(e);
                                          }}
                                          checked={field.value}
                                          type="checkbox"
                                          required={true}
                                          className="resize-none"
                                          // {...field}
                                        />
                                      </FormControl>
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
                                disabled={isLoading}
                                className={`rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600 ${
                                  isLoading ? 'dsy-loading' : ''
                                }`}
                                onClick={() => {
                                  try {
                                    const validValues = PackageOrderZodSchema.parse(packageOrderForm.getValues());

                                    handleCreateShipmentOrder(validValues);
                                  } catch (error) {
                                    if (error instanceof ZodError) {
                                      console.error(error.issues);
                                      toast.error(`${error.issues[0]?.path.join('.')} ${error.issues[0].message}`);
                                    }
                                  }
                                }}
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <Button
                        className="ml-4"
                        onClick={() => {
                          printLabel();
                        }}
                      >
                        Print Label
                      </Button>
                    </>
                  )}
                </div>

                <span className="text-sm text-[#757c7e]">
                  Created {format(new Date(orderDetailState.order.createdAt), "dd/MM/yyyy 'at' HH:mm")}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-[3px] bg-background p-6 shadow-order-shadow md:col-span-2">
                  {orderDetailState.order &&
                    orderDetailState.order.lineItems
                      .reverse()
                      .map((lineItem: LineItem, index: number) => (
                        <OrderDetailLineItem
                          lineItem={lineItem}
                          index={orderDetailState.order.lineItems.length - index}
                          order={orderDetailState.order}
                          dialogOrderNoteRef={dialogOrderNoteRef}
                          setOrderDetailState={setOrderDetailState}
                        />
                      ))}
                </div>

                <div>
                  <div className="mb-6 rounded-[3px] bg-background shadow-order-shadow">
                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      <h2 className="text-xl font-bold">Customer</h2>
                    </div>
                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      <p className="pb-1 text-base font-bold">Shipment order</p>
                      <p className="mt-2 text-base">
                        <a className="text-warning" href={orderDetailState.order.tracking?.shippingLabelUrl}>
                          Label File
                        </a>
                      </p>
                      {orderDetailState.order.shipmentOrderId && (
                        <>
                          <p className="mt-2 text-base">{orderDetailState.order.shipmentOrderId}</p>
                          <p className="mt-2 text-base">{orderDetailState.order.shipmentOrderStatus}</p>
                          <p className="mt-2 text-base">{orderDetailState.order.shipmentOrderCost}</p>
                          <a
                            className="dsy-link dsy-link-primary mt-2 text-base"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            href={`https://t.17track.net/en?nums=${orderDetailState.order.tracking.trackingNumber}`}
                          >
                            {orderDetailState.order.tracking.trackingNumber}
                          </a>
                        </>
                      )}
                    </div>

                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <p className="pb-1 text-base font-bold">Shipping address</p>
                        {([RoleType.ADMIN, RoleType.WAREHOUSE] as string[]).includes(user?.role || '') && (
                          <button
                            onClick={() => {
                              setOrderDetailState((pre) => ({
                                ...pre,
                                noteType: 'system-note',
                              }));
                              editShippingAddressDialogRef.current?.triggerOpenDialog();
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-base">
                        {`${orderDetailState.order.shippingAddress.firstName} ${
                          orderDetailState.order.shippingAddress.lastName ?? ''
                        }`}
                      </p>
                      <p className="mt-2 text-base">{orderDetailState.order.shippingAddress.email ?? ''}</p>
                      <p className="mt-2 text-base">{orderDetailState.order.shippingAddress.addressLine1}</p>
                      <p className="mt-2 text-base">{orderDetailState.order.shippingAddress.addressLine2}</p>
                      <p className="mt-2 text-base">
                        {`${orderDetailState.order.shippingAddress.city} ${orderDetailState.order.shippingAddress.region} ${orderDetailState.order.shippingAddress.zip} ${orderDetailState.order.shippingAddress.country}`}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 rounded-[3px] bg-background shadow-order-shadow">
                    <div className="flex justify-between border-b border-[#e3e4e5] px-6 py-4">
                      <h2 className="text-xl font-bold">Note</h2>
                    </div>
                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        {/* <p className="text-sm text-destructive">Note: {orderDetailState.order.sellerNote}</p> */}
                        {/* {([RoleType.ADMIN, RoleType.SELLER] as string[]).includes(user?.role || '') && (
                          <button
                            onClick={() => {
                              setOrderDetailState((pre) => ({
                                ...pre,
                                noteType: 'seller-note',
                              }));
                              dialogOrderNoteRef.current?.triggerOpenDialog();
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                          </button>
                        )} */}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <p className="text-sm text-destructive">Gift Message: {orderDetailState.order.giftMessage}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <p className="text-sm text-destructive">System Note: {orderDetailState.order.systemNote}</p>
                        {([RoleType.ADMIN, RoleType.MANAGER, RoleType.WAREHOUSE] as string[]).includes(
                          user?.role || '',
                        ) && (
                          <button
                            onClick={() => {
                              setOrderDetailState((pre) => ({
                                ...pre,
                                noteType: 'system-note',
                              }));
                              dialogOrderNoteRef.current?.triggerOpenDialog();
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {[RoleType.ADMIN, RoleType.MANAGER, RoleType.WAREHOUSE].includes(user?.role) && (
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <p className="text-sm text-destructive">Private Note: {orderDetailState.order.privateNote}</p>
                          <button
                            onClick={() => {
                              setOrderDetailState((pre) => ({
                                ...pre,
                                noteType: 'private-note',
                              }));
                              dialogOrderNoteRef.current?.triggerOpenDialog();
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {([RoleType.ADMIN, RoleType.SELLER, RoleType.MANAGER, RoleType.DESIGNER] as string[]).includes(
                    user?.role || '',
                  ) && (
                    <div className="mb-6 rounded-[3px] bg-background shadow-order-shadow">
                      <div className="flex justify-between border-b border-[#e3e4e5] px-6 py-4">
                        <h2 className="text-xl font-bold">Order Barcode</h2>
                      </div>
                      <div>{<SvgBarcode classes="w-full" value={orderDetailState.order.name} />}</div>
                    </div>
                  )}

                  <div className="mb-6 rounded-[3px] bg-background shadow-order-shadow">
                    <div className="flex justify-between border-b border-[#e3e4e5] px-6 py-4">
                      <h2 className="text-xl font-bold">Billing</h2>
                      <CustomDropdownMenu
                        menuTrigger={downloadDropdown.menuTrigger}
                        menuGroup={downloadDropdown.menuGroup}
                      />
                    </div>

                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      {/* <div className="flex justify-between">
                        <p className="text-base">Production cost</p> */}
                      {/* <p className="text-base">USD {orderDetailState.order?.orderDetail.productionCost}</p> */}
                      {/* </div> */}

                      {/* <div className="flex justify-between">
                        <p className="text-base">Shipping (Standard)</p> */}
                      {/* <p className="text-base">USD {orderDetailState.order?.orderDetail.shippingCost}</p> */}
                      {/* </div> */}
                    </div>

                    <div className="border-b border-[#e3e4e5] px-6 py-4">
                      <div className="flex justify-between">
                        <p className="text-base">Total cost</p>
                        <p className="text-base">USD ${orderDetailState.order.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog
                        onOpenChange={(value) => {
                          if (!value) {
                            cancelOrderForm.reset();
                          }
                        }}
                      >
                        <DialogTrigger className="w-full rounded-[5px] border bg-primary p-2 text-base text-white hover:bg-primary hover:text-white disabled:opacity-60">
                          Cancel
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cancel</DialogTitle>
                          </DialogHeader>
                          <Form {...cancelOrderForm}>
                            <div className="grid gap-4 py-4">
                              <FormField
                                control={cancelOrderForm.control}
                                name="orderCancellationReasons"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right">Reason</FormLabel>
                                      <Select onValueChange={field.onChange}>
                                        <FormControl className="col-span-3">
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a reason" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {CancellationReasons.map((reason, index) => {
                                            return (
                                              <SelectItem key={`${reason}${index}`} value={reason}>
                                                {reason}
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
                              <FormField
                                control={cancelOrderForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="col-span-1 text-right">Description</FormLabel>
                                      <FormControl className="col-span-3">
                                        <Textarea
                                          placeholder="Tell us a little bit about reason cancel"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
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
                                onClick={cancelOrderForm.handleSubmit(onSubmitCancel)}
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div></div>
                  </div>
                </div>
                <TebToastContainer />
              </div>
            </>
          )}
        </>
      )}
      <OrderNoteDialog
        ref={dialogOrderNoteRef}
        lineItemId={orderDetailState.lineItemIdForNote}
        setOrderDetailState={setOrderDetailState}
        noteType={orderDetailState.noteType}
        note={noteValue}
        orderId={orderDetailState.order._id}
      />
      <EditShippingAddressDialog
        ref={editShippingAddressDialogRef}
        setOrderDetailState={setOrderDetailState}
        shippingAddress={orderDetailState.order.shippingAddress}
        orderId={orderDetailState.order._id}
      />
    </>
  );
};

export { OrderDetail };
