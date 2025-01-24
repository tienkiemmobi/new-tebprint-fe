import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { NoteType, OrderNoteDto } from 'shared';
import { OrderNoteZodSchema } from 'shared';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Form } from 'ui';

import { DialogFormField } from '@/components';
import { orderService } from '@/services';

import type { OrderDetailState } from './OrderDetail';

type OrderNoteDialogState = {
  isOpen: boolean;
  isUploading: boolean;
};

type OrderNoteDialogProps = {
  orderId?: string;
  lineItemId?: string;
  note?: string;
  noteType?: NoteType;
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

export type OrderNoteDialogRef = {
  triggerOpenDialog: () => void;
};

const OrderNoteDialog = forwardRef<OrderNoteDialogRef, OrderNoteDialogProps>(
  ({ lineItemId = '', note = '', orderId = '', noteType, setOrderDetailState }, ref) => {
    const [orderNoteDialogState, setOrderNoteDialogState] = useState<OrderNoteDialogState>({
      isOpen: false,
      isUploading: false,
    });

    const form = useForm<OrderNoteDto>({
      resolver: zodResolver(OrderNoteZodSchema),
      mode: 'all',
      defaultValues: {
        note,
      },
    });

    useEffect(() => {
      if (!orderNoteDialogState.isOpen) {
        setOrderDetailState((pre) => ({
          ...pre,
          lineItemIdForNote: undefined,
          noteType: undefined,
        }));
      } else {
        form.reset({
          note,
        });
      }
    }, [orderNoteDialogState.isOpen, note]);

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        setOrderNoteDialogState((pre) => ({ ...pre, isOpen: true }));
      },
    }));

    const handleUpdateOrderItemNote = async (data: OrderNoteDto) => {
      if (noteType === 'system-note') {
        const orderItemNoteResponse = await orderService.updateOrderItemSystemNote(data.note, lineItemId);
        if (!orderItemNoteResponse.success || !orderItemNoteResponse.data) {
          toast.error(orderItemNoteResponse.message);

          return;
        }

        toast.success('Update Order Item Note Success');
      } else if (noteType === 'seller-note') {
        const orderItemNoteResponse = await orderService.updateOrderItemNote(data.note, lineItemId);
        if (!orderItemNoteResponse.success || !orderItemNoteResponse.data) {
          toast.error(orderItemNoteResponse.message);

          return;
        }

        toast.success('Update Order Item Note Success');
      } else {
        toast.error('Invalid Note Type');

        return;
      }

      setOrderDetailState((pre) => ({
        ...pre,
        order: {
          ...pre.order,
          lineItems: pre.order.lineItems.map((item) => {
            if (item._id !== lineItemId) return item;

            return {
              ...item,
              systemNote: noteType === 'system-note' ? data.note : item.systemNote,
              sellerNote: noteType === 'seller-note' ? data.note : item.sellerNote,
            };
          }),
        },
      }));
    };

    const handleUpdateOrderNote = async (data: OrderNoteDto) => {
      if (noteType === 'system-note') {
        const orderNoteResponse = await orderService.updateOrderSystemNote(data.note, orderId);
        if (!orderNoteResponse.success || !orderNoteResponse.data) {
          toast.error(orderNoteResponse.message);

          return;
        }

        toast.success('Update order system note successfully');
      } else if (noteType === 'seller-note') {
        const orderNoteResponse = await orderService.updateOrderNote(data.note, orderId);
        if (!orderNoteResponse.success || !orderNoteResponse.data) {
          toast.error(orderNoteResponse.message);

          return;
        }

        toast.success('Update order note successfully');
      } else if (noteType === 'private-note') {
        const orderNoteResponse = await orderService.updatePrivateNote(data.note, orderId);
        if (!orderNoteResponse.success || !orderNoteResponse.data) {
          toast.error(orderNoteResponse.message);

          return;
        }

        toast.success('Update order private note successfully');
      } else {
        toast.error('Invalid Note Type');

        return;
      }

      setOrderDetailState((pre) => ({
        ...pre,
        order: {
          ...pre.order,
          systemNote: noteType === 'system-note' ? data.note : pre.order.systemNote,
          sellerNote: noteType === 'seller-note' ? data.note : pre.order.sellerNote,
          privateNote: noteType === 'private-note' ? data.note : pre.order.privateNote,
        },
      }));
    };

    const onSubmit = async (data: OrderNoteDto) => {
      if (!noteType) {
        toast.error('Some thing wrong');

        return;
      }

      if (lineItemId) {
        await handleUpdateOrderItemNote(data);
      } else if (orderId) {
        await handleUpdateOrderNote(data);
      }

      setOrderNoteDialogState((pre) => ({ ...pre, isOpen: false }));
    };

    return (
      <Dialog
        open={orderNoteDialogState.isOpen}
        onOpenChange={(value) => setOrderNoteDialogState((pre) => ({ ...pre, isOpen: value }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteType === 'system-note' ? 'Update system note' : 'Update seller note'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <div className="grid gap-4 py-4">
              <DialogFormField form={form} zodSchema={OrderNoteZodSchema} name="note" placeholder="Note" />
            </div>
            <DialogFooter>
              <Button
                className="rounded-[5px] border bg-green-500 p-2 text-base text-white hover:bg-green-700 hover:text-white disabled:opacity-60"
                onClick={form.handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);

export { OrderNoteDialog };
