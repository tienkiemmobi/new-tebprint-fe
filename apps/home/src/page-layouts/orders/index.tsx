import type { PaginationState } from '@tanstack/react-table';
import { Camera, ChevronDown } from 'lucide-react';
import * as onScan from 'onscan.js';
// @ts-ignore
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { OrderStatistic, Product } from 'shared';
import { camelCaseToWords } from 'shared';
import type { CustomDropdownMenuProps, ParamUrl } from 'ui';
import {
  Button,
  CustomDropdownMenu,
  DatePickerWithRange,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
  Scanner,
  Search,
  TebToastContainer,
} from 'ui';
import * as XLSX from 'xlsx';

import type { StatusDetail } from '@/constants';
import { DEFAULT_PAGINATION, RoleType, STATUS_ORDERS } from '@/constants';
import type { MeDto, Order, OrderExportCsvDto, Store } from '@/interfaces';
import { orderService, storeService } from '@/services';
import { useAuthStore } from '@/store';

import { OrderDetail } from './OrderDetail';
import { OrderSelectProduct } from './OrderSelectProduct';
import { PayOrders } from './OrdersPay';
import { OrdersTable } from './OrdersTable';

const sampleOrder: Order = {
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
};

type StatusState = {
  isChosen: boolean;
} & StatusDetail;

type OrdersState = {
  statuses: StatusState[];
  filterDate: string;
  orderId?: string;
  isCameraActive: boolean;
};
export type OrderSelectDialog = {
  isDialogSelectProductOpen: boolean;
  myProduct?: Product[];
};

export type PayOrdersDialog = {
  isDialogPayOrdersOpen: boolean;
  orders?: Order[];
  total?: number;
};

const handleConvertToOrderState = (
  initState: OrdersState,
  statuses: StatusDetail[],
  quantityData?: OrderStatistic | null,
) => {
  if (quantityData === null || quantityData === undefined) return initState;
  initState.statuses = statuses.map((statusObj, index) => ({
    ...statusObj,
    isChosen: index === 0,
    total: statusObj.title === '' ? undefined : quantityData[statusObj.title as keyof OrderStatistic],
  }));

  return initState;
};

type OrdersProps = {
  orderIdUrl?: string;
  referer: string;
};

const Orders: React.FC<OrdersProps> = (props) => {
  const [user, setUser] = useState<MeDto | null>();
  const statusChosenRef = React.useRef<number>(0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [resetCheckBox, setResetCheckbox] = useState<boolean>(false);
  const { referer, orderIdUrl } = props;
  const initOrdersState: OrdersState = {
    statuses: [],
    filterDate: '',
    orderId: orderIdUrl,
    isCameraActive: false,
  };

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 1, pageSize: 20 });
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [statusParamUrl, setStatusParamUrl] = useState('');
  const [paramUrl, setParamUrl] = useState<ParamUrl[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [ordersTotal, setOrdersTotal] = useState(0);
  const [productParamUrl, setProductParamUrl] = useState('');

  const [ordersState, setOrdersState] = React.useState<OrdersState>(
    handleConvertToOrderState(initOrdersState, STATUS_ORDERS),
  );

  const [orderSelectDialog, setOrderSelectDialog] = useState<OrderSelectDialog>({
    isDialogSelectProductOpen: false,
  });

  const [payOrdersDialog, setPayOrdersDialog] = useState<PayOrdersDialog>({
    isDialogPayOrdersOpen: false,
  });

  const handleSelectAllOrders = (value: boolean) => {
    setSelectedOrders([]);
    if (value) {
      const ordersId = orders.map((order) => order._id);
      const uniqueIds = Array.from(new Set([...selectedOrders, ...ordersId]));
      setSelectedOrders(uniqueIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const filteredOrders = () => {
    return orders.filter((order) => selectedOrders.includes(order._id));
  };

  const ListOrder: Order[] = filteredOrders().map((orderItem) => {
    const newOrder: Record<string, unknown> = { ...sampleOrder };

    const keys = Object.keys(newOrder);
    // eslint-disable-next-line array-callback-return
    keys.map((item) => {
      newOrder[item] = orderItem[item as keyof Order];
    });

    return newOrder as unknown as Order;
  });

  const handleConvertOrders = () => {
    const updatedFakeOrders = ListOrder.map((order) => {
      const renameMap: Record<string, string> = { id: 'orderId' };

      const res = Object.fromEntries(Object.entries(order).map(([key, value]) => [renameMap[key] ?? key, value]));

      return res as Order;
    });

    const updatedFakeOrdersWithItems = updatedFakeOrders.map((order) => {
      const clonedObject: OrderExportCsvDto = { ...order };
      delete clonedObject.shippingAddress;
      delete clonedObject.tracking;
      delete clonedObject.logs;
      delete clonedObject.lineItems;
      delete clonedObject.shippingEvents;
      delete clonedObject.updatedAt;
      delete clonedObject.createdAt;

      return order.lineItems.map((item) => ({
        ...clonedObject,
        lineItems: item._id,
        productTitle: item.product.title,
        productCode: item.product.productCode,
        category: item.product.category,
        productionTime: item.product.productionTime,
        shippingTime: item.product.shippingTime,
        notes: item.product.notes,
        variantId: item.variant,
      }));
    });
    const flattenedArray = updatedFakeOrdersWithItems.flatMap((nestedSubArray) => nestedSubArray);

    return flattenedArray;
  };

  const convertedNormalWords = handleConvertOrders().map((order) => {
    const convertedOrder: Record<string, unknown> = {};

    Object.keys(order).forEach((key) => {
      const convertedKey = camelCaseToWords(key);

      convertedOrder[convertedKey] = order[key as keyof OrderExportCsvDto];
    });

    return convertedOrder;
  });

  const handleExport = () => {
    if (selectedOrders.length) {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(convertedNormalWords);

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const csvFilePath = `List Order-${new Date().toLocaleString()}.csv`;
      XLSX.writeFile(workbook, csvFilePath);
      setSelectedOrders([]);
      setResetCheckbox(true);
    } else {
      toast.warning('Please select orders to download CSV');
    }
  };

  const handleRenderTopDropdownList = () => {
    const dropdownList: CustomDropdownMenuProps[] = [
      {
        menuTrigger: (
          <Button variant="outline">
            CSV Import / Export <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        menuGroup: [
          {
            group: [
              {
                element: (
                  <div className="cursor-pointer">
                    <button onClick={handleExport}>Export as CSV</button>
                  </div>
                ),
              },
            ],
          },
        ],
      },
    ];

    if (user?.role === RoleType.SELLER) {
      dropdownList[0]?.menuGroup[0]?.group.unshift({
        element: (
          <div className="cursor-pointer">
            <a href="/orders/import">Import CSV file</a>
          </div>
        ),
      });

      dropdownList.push({
        menuTrigger: (
          <Button>
            Create order {user?.role !== RoleType.SELLER} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        menuGroup: [
          {
            group: [
              {
                element: (
                  <a href="/create-order" className="block h-full w-full cursor-pointer">
                    Manual
                  </a>
                ),
              },
            ],
          },
        ],
      });
    }

    return dropdownList;
  };

  const handleSelectedOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleClickChooseStatus = useCallback((statusName: string, index: number) => {
    statusChosenRef.current = index;
    setStatusParamUrl(statusName);
    setParamUrl((prev) => {
      let updatedParams = [...prev];
      let found = false;

      updatedParams = updatedParams.map((param) => {
        if (param.keyParamUrl === 'status') {
          param.valueParamUrl = statusName;
          found = true;
        }

        return param;
      });

      if (!found) {
        updatedParams.push({ keyParamUrl: 'status', valueParamUrl: statusName });
      }

      return updatedParams;
    });

    setOrdersState((pre) => ({
      ...pre,
      statuses: pre.statuses.map((item) => ({
        ...item,
        isChosen: item.title === statusName,
      })),
    }));
  }, []);

  const handleSelectStore = (storeCode: string) => {
    setSelectedStore(storeCode);

    setParamUrl((prev) => {
      let updatedParams = [...prev];
      let found = false;

      updatedParams = updatedParams.map((param) => {
        if (param.keyParamUrl === 'store') {
          param.valueParamUrl = storeCode;
          found = true;
        }

        return param;
      });

      if (!found) {
        updatedParams.push({ keyParamUrl: 'store', valueParamUrl: storeCode });
      }

      return updatedParams;
    });
  };

  const handleFilterDate = (pickedDateRange: string) => {
    setOrdersState((pre) => ({
      ...pre,
      filterDate: pickedDateRange,
    }));

    const from = pickedDateRange.split(' - ')[0] as string;
    const to = (pickedDateRange.includes(' - ') ? pickedDateRange.split(' - ')[1] : from) as string;

    setParamUrl((prev) => {
      let updatedParams = [...prev];
      let found = false;

      updatedParams = updatedParams.map((param) => {
        if (param.keyParamUrl === 'from') {
          param.valueParamUrl = from;
          found = true;
        }

        return param;
      });

      if (!found) {
        updatedParams.push({ keyParamUrl: 'from', valueParamUrl: from });
      }

      return updatedParams;
    });

    setParamUrl((prev) => {
      let updatedParams = [...prev];
      let found = false;

      updatedParams = updatedParams.map((param) => {
        if (param.keyParamUrl === 'to') {
          param.valueParamUrl = to;
          found = true;
        }

        return param;
      });

      if (!found) {
        updatedParams.push({ keyParamUrl: 'to', valueParamUrl: to });
      }

      return updatedParams;
    });
  };

  const handleChangeOrderId = (orderId?: string) => {
    setSelectedOrders([]);

    setOrdersState((pre) => ({
      ...pre,
      orderId,
    }));
  };

  const handlePopstate = (event: PopStateEvent) => {
    if (!event.state) {
      handleChangeOrderId();
    } else {
      handleChangeOrderId(event.state.pwOrderId);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setProductParamUrl(product._id);
    setParamUrl((prev) => {
      let updatedParams = [...prev];
      let found = false;

      updatedParams = updatedParams.map((param) => {
        if (param.keyParamUrl === 'productId') {
          param.valueParamUrl = product._id;
          found = true;
        }

        return param;
      });

      if (!found) {
        updatedParams.push({ keyParamUrl: 'productId', valueParamUrl: product._id });
      }

      return updatedParams;
    });
    setSelectedProductId(product._id);
    setOrderSelectDialog((pre) => ({
      ...pre,
      productSelected: { ...product },
      isDialogSelectProductOpen: false,
      myProduct: undefined,
    }));
  };

  const handleSetProducedStatus = async () => {
    const currentOrderId = ordersState.orderId;
    if (!currentOrderId) {
      toast.error('Not in order detail page');

      return;
    }
    const response = await orderService.updateStatus(currentOrderId, 'produced');

    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }

    toast.success(response.message);
  };

  const handleOnScan = async (sCode: string) => {
    if (sCode.startsWith('-Produced')) {
      handleSetProducedStatus();

      return;
    }

    if (sCode.startsWith('-Issue')) {
      alert('Issue');

      return;
    }

    const orderItemDetailResponse = await orderService.getScanOrder(sCode);

    if (!orderItemDetailResponse.data || !orderItemDetailResponse.success) {
      toast.error('Order not found!');

      return;
    }
    const orderItem = orderItemDetailResponse.data._id;

    setOrdersState((prev) => ({
      ...prev,
      orderId: orderItem,
      isCameraActive: false,
    }));
  };

  const fetchStores = async () => {
    const response = await storeService.getStores();
    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }
    setStores([
      // @ts-expect-error all stores case
      {
        _id: '',
        name: 'All',
        code: 'all',
      },
      ...response.data,
    ]);
  };

  useEffect(() => {
    if (orderIdUrl) {
      handleChangeOrderId(orderIdUrl);
    }

    if (!ordersState.orderId && !referer) {
      window.history.replaceState(null, '', '/orders');
    }

    if (referer) {
      window.history.pushState(null, '', window.location.href);
    }

    setUser(useAuthStore.getState().user);

    fetchStores();
  }, []);

  const fetchStatistics = async (filterDate: string) => {
    const from = filterDate.split(' - ')[0];
    const to = filterDate.split(' - ')[1] || from;

    const store = selectedStore === 'all' ? '' : selectedStore;
    const statisticsResponse = await orderService.getStatistics(from, to, store, selectedProductId);
    if (!statisticsResponse.success || !statisticsResponse.data) {
      toast.error(statisticsResponse.message);

      return;
    }

    setOrdersState((pre) => ({
      ...pre,
      statuses: handleConvertToOrderState(initOrdersState, STATUS_ORDERS, statisticsResponse.data).statuses,
    }));
  };

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }

    const fetchOrders = async () => {
      const store = selectedStore === 'all' ? '' : selectedStore;
      const orderResponse = await orderService.getOrders(
        pagination,
        searchValue,
        statusParamUrl,
        productParamUrl,
        store,
        ordersState.filterDate,
      );

      if (!orderResponse.success || !orderResponse.data) {
        toast.error(orderResponse.message);

        return;
      }

      orderResponse.data.forEach((order) => {
        order.lineItems.forEach((lineItem) => {
          if (!lineItem.frontArtwork && lineItem.mockup1) {
            lineItem.frontArtwork = lineItem.mockup1;
          }
        });
      });

      setOrders(orderResponse.data);
      setOrdersTotal(orderResponse.total!);
      if (!orderResponse.data.length) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: DEFAULT_PAGINATION.pageIndex,
          pageSize: DEFAULT_PAGINATION.pageSize,
        }));
      }
    };
    fetchOrders();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    searchValue,
    statusParamUrl,
    productParamUrl,
    selectedStore,
    ordersState.filterDate,
    isParamLoaded,
  ]);

  useEffect(() => {
    // if (([RoleType.ADMIN, RoleType.MANAGER, RoleType.SELLER] as string[]).includes(user?.role || ''))
    fetchStatistics(ordersState.filterDate);
  }, [selectedStore, ordersState.filterDate, selectedProductId]);

  useEffect(() => {
    onScan.attachTo(document, {
      suffixKeyCodes: [13], // enter-key expected at the end of a scan
      // reactToPaste: true, // Compatibility to built-in scanners in paste-mode (as opposed to keyboard-mode)res
      keyCodeMapper(oEvent: KeyboardEvent) {
        // your hyphen-minus code is 45OzRgLrPnwY-a

        if (oEvent.which === 189) {
          return '-';
        }
        // Fall back to the default decoder in all other cases

        return onScan.decodeKeyEvent(oEvent);
      },
      async onScan(sCode: string, iQty: number) {
        // eslint-disable-next-line no-console
        console.log(`Scanned: ${iQty}x ${sCode}`);

        await handleOnScan(sCode);
      },
    });

    return () => {
      onScan.detachFrom(document);
      window.document.removeEventListener('scan', () => {});
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [ordersState.orderId]);

  return (
    <div className="w-full p-4">
      <div className="mx-auto w-full bg-transparent">
        {ordersState.orderId ? (
          <OrderDetail
            orderId={ordersState.orderId}
            handlePopstate={handlePopstate}
            onBackClick={handleChangeOrderId}
          />
        ) : (
          <>
            <div className="flex flex-col justify-between md:flex-row">
              <h2 className="text-[1.75rem] font-bold leading-10 md:text-[2rem]">My orders</h2>
              <div className="flex gap-6">
                {handleRenderTopDropdownList().map((item, index) => (
                  <CustomDropdownMenu
                    key={`topDropdownList${index}`}
                    menuTrigger={item.menuTrigger}
                    menuGroup={item.menuGroup}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 border border-[#e3e4e5] bg-background p-6 shadow-table-shadow">
              <div className="flex flex-col gap-4 md:gap-6">
                <Search placeholder="Search by order number, order name..." onSearch={setSearchValue} />

                <div className="">
                  <div className="">
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 pt-[-10px]">
                      {ordersState.statuses.map((statusObj, index) => {
                        return (
                          <button
                            key={statusObj.name}
                            disabled={statusObj.title === 'totalItems'}
                            className={`flex cursor-pointer items-center whitespace-nowrap rounded-[24px] border px-4 py-1 text-center text-base transition ${
                              statusObj.isChosen
                                ? 'border-[#17262b] bg-[#485256] text-background hover:border-[#17262b] hover:bg-[#17262b]'
                                : 'border-[#647383] bg-[#f7f7f7] hover:border-[#c4c7c8] hover:bg-[#e3e4e5]'
                            }`}
                            onClick={() => handleClickChooseStatus(statusObj.title, index)}
                          >
                            {statusObj.name} {statusObj.total !== undefined ? `(${statusObj.total})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-4 overflow-x-auto lg:ml-auto lg:w-auto lg:justify-end">
                    <OrderSelectProduct
                      open={orderSelectDialog.isDialogSelectProductOpen}
                      myProduct={orderSelectDialog.myProduct}
                      handleSelectProduct={handleSelectProduct}
                      setOrderSelectDialog={setOrderSelectDialog}
                    />
                    <PayOrders
                      open={payOrdersDialog.isDialogPayOrdersOpen}
                      orderIds={selectedOrders}
                      setPayOrdersDialog={setPayOrdersDialog}
                    />
                    <div
                      className="w-fit cursor-pointer justify-center rounded-full border border-primary p-1 align-middle"
                      onClick={() => setOrdersState((pre) => ({ ...pre, isCameraActive: !pre.isCameraActive }))}
                    >
                      <Camera />
                    </div>
                    <div className="flex w-full justify-between px-2 md:w-auto">
                      <DatePickerWithRange
                        popoverDefault={
                          <>
                            Anytime <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        }
                        handleClickChooseRange={handleFilterDate}
                        className="h-10 min-w-[140px] justify-center"
                      />
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          className="flex h-10 w-[100px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm font-normal text-muted-foreground ring-offset-background transition-colors placeholder:text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Button variant="outline">
                            Store
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[calc(var(--radix-dropdown-menu-trigger-width))]">
                          <DropdownMenuGroup>
                            <RadioGroup
                              defaultValue={selectedStore}
                              onValueChange={(value) => handleSelectStore(value)}
                            >
                              {stores.map((store, index) => (
                                <div
                                  key={`${store._id}-${index}`}
                                  className="flex h-8 cursor-pointer items-center gap-2 p-4"
                                >
                                  <RadioGroupItem value={store.code} id="r1" />
                                  <Label htmlFor="r1">{store.name}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                {ordersState.isCameraActive && (
                  <div className={`flex justify-center`}>
                    <Scanner onDetected={handleOnScan} />
                  </div>
                )}

                <div className="mb-4">
                  <OrdersTable
                    data={orders}
                    paramUrl={paramUrl}
                    pagination={pagination}
                    ordersTotal={ordersTotal}
                    searchValue={searchValue}
                    setPagination={setPagination}
                    setSearchValue={setSearchValue}
                    setIsParamLoaded={setIsParamLoaded}
                    handleSelectedOrder={handleSelectedOrder}
                    handleClickRow={handleChangeOrderId}
                    resetCheckBox={resetCheckBox}
                    setResetCheckbox={setResetCheckbox}
                    handleSelectAllOrders={handleSelectAllOrders}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <TebToastContainer />
    </div>
  );
};

export { Orders };
