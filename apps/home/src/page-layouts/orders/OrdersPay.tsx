import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Separator } from 'ui';

import type { Order } from '@/interfaces';
import { orderService } from '@/services';

import type { PayOrdersDialog } from '.';

type OrderPayProps = {
  open: boolean;
  orderIds?: string[];
  setPayOrdersDialog: React.Dispatch<React.SetStateAction<PayOrdersDialog>>;
};

const PayOrders = ({ open, orderIds, setPayOrdersDialog }: OrderPayProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [canPay, setCanPay] = useState<boolean>(false);

  const handleToggleDialog = () => {
    setPayOrdersDialog((pre) => ({
      ...pre,
      isDialogPayOrdersOpen: !pre.isDialogPayOrdersOpen,
    }));
  };

  const calcPayOrders = async () => {
    if (!orderIds || orderIds.length === 0) {
      return;
    }

    const calcPayOrderResponse = await orderService.calcPayOrders(orderIds);

    if (!calcPayOrderResponse.success || !calcPayOrderResponse.data) {
      toast.error(calcPayOrderResponse.message);

      return;
    }

    setPayOrdersDialog((pre) => ({
      ...pre,
    }));
    setOrders(calcPayOrderResponse.data.orders);
    setTotal(calcPayOrderResponse.data.total);
    setCanPay(
      calcPayOrderResponse.data.orders.every((order: Order) => ['pending', 'no_artwork'].includes(order.status)),
    );
  };

  const handlePayOrders = async () => {
    if (!orderIds || orderIds.length === 0) {
      return;
    }
    const payOrderResponse = await orderService.payOrders(orderIds);
    if (!payOrderResponse?.success || !payOrderResponse.data) {
      toast.error(payOrderResponse.message);
    } else {
      toast.success('Pay orders successfully');
    }

    handleToggleDialog();
  };

  useEffect(() => {
    if (open) {
      calcPayOrders();
    } else {
      setPayOrdersDialog((pre) => ({ ...pre }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => handleToggleDialog()}>
      <DialogTrigger asChild>
        <div
          className="flex cursor-pointer flex-row items-center justify-center rounded-[3px] bg-primary p-2 px-4 font-semibold text-white opacity-90 hover:opacity-100"
          data-button-pay="true"
        >
          Pay
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-full max-w-full overflow-auto p-8 md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Pay Orders</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden">
          {orders.map((order) => (
            // order.lineItems.map((lineItem) => {
            //   return (
            //     <div className="flex">
            //       {/* <img src={lineItem.frontArtwork.preview} width={100} height={100} /> */}
            //       <span>{order.externalId}</span>
            //       <div className="flex items-center">{` x ${lineItem.quantity} = $${lineItem.total}`}</div>
            //     </div>
            //   );
            // }),
            <div className="flex">
              {/* <img src={lineItem.frontArtwork.preview} width={100} height={100} /> */}
              <span>{order.externalId}</span> <div className="ml-2 flex items-center">{`x $${order.total}`}</div>
            </div>
          ))}
          <Separator className="mt-4" />
          <p className="mt-8 justify-center font-bold">Total: ${total}</p>
        </div>
        <DialogFooter>
          <DialogTrigger>
            <button className="rounded-[3px] bg-gray-300 px-3 py-2 text-white hover:bg-gray-500">Cancel</button>
          </DialogTrigger>
          <button
            disabled={!canPay}
            onClick={() => handlePayOrders()}
            className="rounded-[3px] bg-primary px-3 py-2 text-white disabled:opacity-25"
            submit-pay="true"
          >
            Pay
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { PayOrders };
