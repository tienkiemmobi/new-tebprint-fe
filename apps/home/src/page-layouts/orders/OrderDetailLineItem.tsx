/* eslint-disable unused-imports/no-unused-vars */
import { format } from 'date-fns';
import { CheckCircle2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import { toast } from 'react-toastify';
import type { OrderLogDto } from 'shared';
import { NO_IMAGE } from 'shared';
import {
  Button,
  CustomDropdown,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SvgBarcodeWithData,
} from 'ui';

import { RoleType } from '@/constants';
import type { LineItem, Order, ShipmentEvent } from '@/interfaces';
import { orderService } from '@/services';
import { useAuthStore } from '@/store';

import type { OrderDetailState } from './OrderDetail';
import type { OrderNoteDialogRef } from './OrderNoteDialog';
import type { UploadArtworkDialogRef } from './UploadArtworkDialog';
import { UploadArtworkDialogDialog } from './UploadArtworkDialog';
import { UploadExternalFileLinkDialog } from './UploadExternalFileLinkDialog';
import type { UploadMockUpDialogRef } from './UploadMockupDialog';
import { UploadMockupDialogDialog } from './UploadMockupDialog';

type OrderDetailLineItemProps = {
  lineItem: LineItem;
  index: number;
  order: Order;
  dialogOrderNoteRef: React.RefObject<OrderNoteDialogRef>;
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

const OrderDetailLineItem = ({
  lineItem,
  index,
  order,
  dialogOrderNoteRef,
  setOrderDetailState,
}: OrderDetailLineItemProps) => {
  const { user } = useAuthStore.getState();

  const dialogUploadArtworkRef = useRef<UploadArtworkDialogRef>(null);
  const dialogUploadMockupRef = useRef<UploadMockUpDialogRef>(null);

  const [currentLineItemId, setCurrentLineItemId] = useState<string | null>(null);

  const [shipmentEvent] = useState<ShipmentEvent[]>([]);

  const handleLineItemSetProducedStatus = async (lineItemId: string) => {
    const response = await orderService.setLineItemProduced(lineItemId);

    if (!response.success || !response.data) {
      toast.error(response.message);

      return;
    }

    toast.success(response.message);
    setOrderDetailState((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        lineItems: prev.order.lineItems.map((item) => {
          if (item._id === lineItemId) {
            return {
              ...item,
              status: 'produced',
            };
          }

          return item;
        }),
      },
    }));
  };

  // zoom
  const frontArtworkRef = useRef();
  const onFrontArtworkUpdate = useCallback(({ x, y, scale }) => {
    const { current: img } = frontArtworkRef;

    if (img) {
      const value = make3dTransformValue({ x, y, scale });

      img.style.setProperty('transform', value);
    }
  }, []);

  const backArtworkRef = useRef();
  const onBackArtworkUpdate = useCallback(({ x, y, scale }) => {
    const { current: img } = backArtworkRef;

    if (img) {
      const value = make3dTransformValue({ x, y, scale });

      img.style.setProperty('transform', value);
    }
  }, []);

  return (
    <>
      <div className="mb-6 w-full" key={lineItem._id}>
        <div className="w-full rounded-t-[3px] border-x border-t border-[#ebebeb] p-4">
          <div className="w-full">
            <div className="w-full pb-4 lg:w-auto">
              <Button
                disabled={lineItem.status === 'produced'}
                className="mb-4"
                onClick={() => {
                  handleLineItemSetProducedStatus(lineItem._id);
                }}
              >
                Item Produced
              </Button>
              <p className="text-lg font-semibold leading-8">{lineItem.barcode}</p>
              <p className="text-sm">{lineItem._id}</p>

              <div className="flex flex-wrap items-center whitespace-nowrap">
                <span className="mr-4">Item {index}</span>
                <span className="mr-4">Quantity: {lineItem.quantity}</span>
                <span className="font-semibold text-primary">
                  {lineItem.product.title}
                  {`${lineItem.variantStyle} / ${lineItem.variantColor} / ${lineItem.variantSize}`}
                </span>
              </div>
              <p className="text-sm text-[#686f71]"></p>
            </div>

            <div id="portal" style={{ position: 'fixed', top: '50px', zIndex: 9999 }} />
            <div className="flex w-full flex-col justify-around">
              <div className="flex flex-col items-center">
                <QuickPinchZoom onUpdate={onFrontArtworkUpdate} wheelScaleFactor={300}>
                  <img ref={frontArtworkRef} src={lineItem.frontArtwork ? lineItem.frontArtwork.url : NO_IMAGE} />
                </QuickPinchZoom>
                <div className="mb-2 mt-6 flex items-center gap-4">
                  <p className="text-base">Front Artwork</p>
                </div>
              </div>

              {lineItem.backArtwork && (
                <div className="flex flex-col items-center">
                  <QuickPinchZoom onUpdate={onBackArtworkUpdate} wheelScaleFactor={300}>
                    <img ref={backArtworkRef} src={lineItem.backArtwork ? lineItem.backArtwork.url : NO_IMAGE} />
                  </QuickPinchZoom>
                  <div className="mb-2 mt-6 flex items-center gap-4">
                    <p className="text-base">Back Artwork</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center">
                <img
                  className="h-[150px] w-[150px] object-contain"
                  src={lineItem.mockup1 ? lineItem.mockup1.preview : NO_IMAGE}
                  alt=""
                />
                <div className="mb-2 mt-6 flex items-center gap-4">
                  <p className="text-base">Mockup</p>
                </div>
              </div>

              {lineItem.mockup2 && (
                <div className="flex flex-col items-center">
                  <img
                    className="h-[150px] w-[150px] object-contain"
                    src={lineItem.mockup2 ? lineItem.mockup2.preview : NO_IMAGE}
                    alt=""
                  />
                  <div className="mb-2 mt-6 flex items-center gap-4">
                    <p className="text-base">Mockup</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 w-full">
            <div className="my-2 box-border flex min-h-[56px] items-center rounded-[3px] border border-primary bg-[#f3dba9] p-[calc(1rem-1px)] text-primary">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>
                Timeline on <strong>{new Date().toLocaleDateString()}</strong>
              </span>
            </div>
          </div>

          <div className="mt-6 flex overflow-x-auto whitespace-nowrap">
            {order.logs?.length >= 0 &&
              order.logs.map((log: OrderLogDto, logIndex) => (
                <>
                  {log.status && (
                    <div key={`logIndex${logIndex}`} className="basis-[30%]">
                      <div
                        className={`flex items-center bg-primary py-[6px] pr-[22px] font-medium text-background ${
                          logIndex === 0 ? 'rounded-l-[70px] pl-3' : ''
                        } ${logIndex === order.logs.length - 1 ? 'rounded-r-[70px]' : ''} ${
                          log.status === 'done' ? 'rounded-r-[70px]' : ''
                        }`}
                      >
                        <CheckCircle2 className="mr-2 h-6 w-6" />
                        <span>{log.status}</span>
                      </div>
                      <div className="p-3">{format(new Date(log.date), 'hh:mm dd/MM/yyyy ')}</div>
                    </div>
                  )}
                </>
              ))}
          </div>
        </div>

        <div className="w-full rounded-b-[3px] border border-[#ebebeb] p-4">
          <div className="mb-2 flex justify-between">
            <p className="text-sm">Production cost</p>
            <p className="text-base">USD ${lineItem.total}</p>
          </div>

          <div className="mb-2 flex justify-between">
            <p className="flex items-center text-base">
              {/* <a href="#">{orderDetailState.order?.orderDetail.productionCost}</a> */}
            </p>
          </div>
          <div className="mb-2 flex justify-between">
            <p className="text-sm">Seller Note: {lineItem.sellerNote}</p>
            {([RoleType.ADMIN, RoleType.SELLER] as string[]).includes(user?.role || '') && (
              <button
                onClick={() => {
                  setOrderDetailState((pre) => ({
                    ...pre,
                    noteType: 'seller-note',
                    lineItemIdForNote: lineItem._id,
                  }));
                  dialogOrderNoteRef.current?.triggerOpenDialog();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mb-2 flex justify-between">
            <p className="text-sm">System Note: {lineItem.systemNote}</p>
            {([RoleType.ADMIN, RoleType.MANAGER] as string[]).includes(user?.role || '') && (
              <button
                onClick={() => {
                  setOrderDetailState((pre) => ({
                    ...pre,
                    noteType: 'system-note',
                    lineItemIdForNote: lineItem._id,
                  }));
                  dialogOrderNoteRef.current?.triggerOpenDialog();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mb-2">
            <p className="text-sm text-[red]">Production Files: {lineItem.systemNote}</p>
            {lineItem.externalFileLinks.map((file) => (
              <p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[green] underline"
                  key={file._id}
                >
                  {file.fileName}
                </a>
              </p>
            ))}
          </div>

          <div className="mb-2 flex justify-center"></div>

          {([RoleType.ADMIN, RoleType.SELLER, RoleType.MANAGER, RoleType.DESIGNER] as string[]).includes(
            user?.role || '',
          ) && (
            <div className="mt-5 flex h-full w-full flex-row justify-between overflow-scroll md:overflow-hidden">
              <SvgBarcodeWithData
                value={lineItem.barcode}
                height={200}
                width={280}
                name={lineItem.product.title}
                numberInOrder={`#${index + 1}/${order.lineItems?.length ?? 0}`}
                color={lineItem.variantColor || ''}
                date={format(new Date(lineItem.createdAt), 'dd/MM/yyyy')}
                orderId={order._id}
                productCode={lineItem.product.productCode}
                packageCode="455147926"
                packageName="BH-2310-081 (121/146)"
              />
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div>
              <CustomDropdown
                title="Details"
                labelStyle="h-[40px] w-[120px] px-6 py-2 cursor:pointer text-lg box-border border border-[#c4c7c8] font-medium hover:text-[#29ab51] transition-all"
                rightIcon={<ChevronDown />}
                rightToggleIcon={<ChevronUp />}
                dropDownContent={
                  <div>
                    {shipmentEvent.map((nestItem, i: number) => (
                      <div key={`shipment${i}`} className="relative flex min-h-[50px] justify-between pl-[34px]">
                        <div className="absolute left-0 top-0 h-full">
                          <div className='relative h-full whitespace-normal pl-6 before:absolute before:left-0 before:top-[3px] before:h-4 before:w-4 before:rounded-[50%] before:bg-[#29ab51] before:opacity-40 before:content-[""] after:absolute after:left-0 after:top-[3px] after:ml-[2px] after:mt-[2px] after:h-3 after:w-3 after:rounded-[50%] after:bg-[#29ab51] after:content-[""]'>
                            <div className="absolute left-[7px] top-[25px] h-[calc(100%-25px)] w-2 border-l-2 border-[#ebebeb]"></div>
                          </div>
                        </div>

                        <div className="pb-4">
                          <p className="mb-4 mt-1 text-sm font-normal text-[#949494]">
                            {format(new Date(nestItem?.date) || new Date(), 'MMM d, yyyy hh:mm a')}
                          </p>
                          <p className="text-base font-medium">{nestItem?.detail ?? ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button className="bg-white" variant="outline">
                  Action order item <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(var(--radix-dropdown-menu-trigger-width))]">
                <DropdownMenuGroup>
                  {/* (item.status === 'artwork_error' &&
                                    ([RoleType.SELLER, RoleType.DESIGNER] as string[]).includes(user?.role || '')) ||
                                    item.status === 'no_artwork' || */}
                  {true && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setCurrentLineItemId(lineItem._id);
                        dialogUploadArtworkRef.current?.triggerOpenDialog();
                      }}
                    >
                      Update Artwork
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      dialogUploadMockupRef.current?.triggerOpenDialog();
                    }}
                  >
                    Update Mockup
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <UploadArtworkDialogDialog
              lineItemId={currentLineItemId || ''}
              setOrderDetailState={setOrderDetailState}
              artwork={{ front: lineItem.frontArtwork, back: lineItem.backArtwork }}
              status={lineItem.status}
              ref={dialogUploadArtworkRef}
            />

            <UploadMockupDialogDialog
              lineItemId={lineItem._id}
              setOrderDetailState={setOrderDetailState}
              mockup={{ mockup1: lineItem.mockup1, mockup2: lineItem.mockup2 }}
              ref={dialogUploadMockupRef}
            />

            <UploadExternalFileLinkDialog
              lineItemId={lineItem._id}
              externalFileLinks={lineItem.externalFileLinks}
              setOrderDetailState={setOrderDetailState}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export { OrderDetailLineItem };
