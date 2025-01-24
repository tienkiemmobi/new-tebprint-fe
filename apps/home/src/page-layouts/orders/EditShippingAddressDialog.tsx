import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { ShippingAddressDto } from 'shared';
import { ShippingAddressZodSchema } from 'shared';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Form } from 'ui';

import { DialogFormField } from '@/components';
import { orderService } from '@/services';

import type { OrderDetailState } from './OrderDetail';

type EditShippingAddressDialogProps = {
  orderId: string;
  shippingAddress: ShippingAddressDto;
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

export type EditShippingAddressDialogRef = {
  triggerOpenDialog: () => void;
};

const EditShippingAddressDialog = forwardRef<EditShippingAddressDialogRef, EditShippingAddressDialogProps>(
  ({ shippingAddress, orderId, setOrderDetailState }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ShippingAddressDto>({
      resolver: zodResolver(ShippingAddressZodSchema),
      mode: 'all',
      defaultValues: {
        ...shippingAddress,
      },
    });

    useEffect(() => {
      if (!isOpen) {
        setOrderDetailState((pre) => ({
          ...pre,
        }));
      } else {
        form.reset({
          ...shippingAddress,
        });
      }
    }, [isOpen]);

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        setIsOpen(true);
      },
    }));

    const handleUpdateShippingAddress = async (data: ShippingAddressDto) => {
      const responseData = await orderService.updateShippingAddress(orderId, data);
      if (!responseData.success || !responseData.data) {
        toast.error(responseData.message);

        return;
      }

      toast.success('Update shipping address success');

      setOrderDetailState((pre) => ({
        ...pre,
        order: {
          ...pre.order,
          shippingAddress: data,
        },
      }));
    };

    const onSubmit = async (data: ShippingAddressDto) => {
      setIsSubmitting(true);

      handleUpdateShippingAddress(data);

      setIsSubmitting(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update shipping address</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <div className="grid gap-4 py-4">
              <DialogFormField
                form={form}
                zodSchema={ShippingAddressZodSchema}
                name="firstName"
                placeholder="First Name"
              />
              <DialogFormField
                form={form}
                zodSchema={ShippingAddressZodSchema}
                name="lastName"
                placeholder="Last Name"
              />
              <DialogFormField
                form={form}
                zodSchema={ShippingAddressZodSchema}
                name="addressLine1"
                placeholder="Address Line 1"
                label="Addr Line 1"
              />
              <DialogFormField
                form={form}
                zodSchema={ShippingAddressZodSchema}
                name="addressLine2"
                placeholder="Address Line 2"
                label="Addr Line 2"
              />
              <DialogFormField form={form} zodSchema={ShippingAddressZodSchema} name="city" placeholder="City" />
              <DialogFormField form={form} zodSchema={ShippingAddressZodSchema} name="zip" placeholder="Zip" />
              <DialogFormField form={form} zodSchema={ShippingAddressZodSchema} name="region" placeholder="Region" />
              <DialogFormField form={form} zodSchema={ShippingAddressZodSchema} name="country" placeholder="Country" />
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={isSubmitting}
                className="rounded-[5px] border bg-green-500 p-2 text-base text-white hover:bg-green-700 hover:text-white disabled:opacity-60"
                onClick={form.handleSubmit(onSubmit)}
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);

export { EditShippingAddressDialog };
