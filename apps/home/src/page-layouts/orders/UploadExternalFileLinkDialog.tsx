import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from 'ui';
import { z } from 'zod';

import { orderService } from '@/services';

import type { OrderDetailState } from './OrderDetail';

const uploadExternalFileLinkItemSchema = z.object({
  url: z.string().min(1, { message: 'Url is required' }),
  fileName: z.string().optional(),
});

export type UploadExternalFileLinkItemDto = z.infer<typeof uploadExternalFileLinkItemSchema>;

const uploadExternalFileLinkSchema = z.object({
  externalFileLinks: z.array(uploadExternalFileLinkItemSchema),
});

export type UploadExternalFileLinkDto = z.infer<typeof uploadExternalFileLinkSchema>;

type UploadExternalFileLinkState = {
  isOpen: boolean;
  isUploading: boolean;
};

type UploadExternalFileLinkProps = {
  lineItemId: string;
  externalFileLinks: UploadExternalFileLinkItemDto[];
  setOrderDetailState: React.Dispatch<React.SetStateAction<OrderDetailState>>;
};

const UploadExternalFileLinkDialog = ({
  lineItemId,
  externalFileLinks,
  setOrderDetailState,
}: UploadExternalFileLinkProps) => {
  const [uploadExternalFileLinkState, setUploadExternalFileLinkState] = useState<UploadExternalFileLinkState>({
    isOpen: false,
    isUploading: false,
  });

  const uploadExternalFileLinkForm = useForm<UploadExternalFileLinkDto>({
    resolver: zodResolver(uploadExternalFileLinkSchema),
    mode: 'all',
  });

  const formArrayExternalFileLinks = useFieldArray({
    name: 'externalFileLinks',
    control: uploadExternalFileLinkForm.control,
  });

  useEffect(() => {
    if (uploadExternalFileLinkState.isOpen) formArrayExternalFileLinks.append(externalFileLinks);
    else formArrayExternalFileLinks.remove();
  }, [externalFileLinks.length, uploadExternalFileLinkState.isOpen]);

  const handleSaveChanges = async (data: UploadExternalFileLinkDto) => {
    setUploadExternalFileLinkState((pre) => ({ ...pre, isUploading: true }));
    const uploadResponse = await orderService.updateExternalFileLinks(lineItemId, data.externalFileLinks);

    if (!uploadResponse.success || !uploadResponse.data) {
      toast.error(uploadResponse.message);
      setUploadExternalFileLinkState((pre) => ({ ...pre, isUploading: false }));

      return;
    }

    setUploadExternalFileLinkState((pre) => ({ ...pre, isUploading: false }));

    let isAllValid = true;
    uploadResponse.data.forEach((item) => {
      const fieldIndex = uploadExternalFileLinkForm
        .getValues('externalFileLinks')
        .findIndex((nestItem) => nestItem.url === item.url);

      if (fieldIndex !== -1) {
        if (!item.success) {
          uploadExternalFileLinkForm.setError(`externalFileLinks.${fieldIndex}.url`, { message: item.message });
          isAllValid = false;
        }
        uploadExternalFileLinkForm.setValue(`externalFileLinks.${fieldIndex}.fileName`, item.fileName);
      }
    });

    if (isAllValid) {
      setUploadExternalFileLinkState((pre) => ({ ...pre, isOpen: false }));
      setOrderDetailState((pre) => {
        if (!pre.order) return pre;

        return {
          ...pre,
          order: {
            ...pre.order,
            lineItems: pre.order?.lineItems.map((item) => {
              if (item._id !== lineItemId) return item;

              return {
                ...item,
                externalFileLinks: (uploadResponse.data || [])?.map((nestItem) => ({
                  fileName: nestItem.fileName,
                  url: nestItem.url,
                })),
              };
            }),
          },
        };
      });
      toast.success('Add success');
    } else toast.error('Some field wrong');
  };

  return (
    <Dialog
      open={uploadExternalFileLinkState.isOpen}
      onOpenChange={(value) => setUploadExternalFileLinkState((pre) => ({ ...pre, isOpen: value }))}
    >
      <Button variant="secondary" onClick={() => setUploadExternalFileLinkState((pre) => ({ ...pre, isOpen: true }))}>
        Upload External File Link
      </Button>
      <DialogContent className="max-w-none lg:!w-[80vw]">
        <DialogHeader>
          <DialogTitle>External File Links</DialogTitle>
        </DialogHeader>
        <Form {...uploadExternalFileLinkForm}>
          {formArrayExternalFileLinks.fields.map((item, index) => (
            <div key={`external-file-${item.id}`} className="mt-2 flex items-start justify-between gap-2">
              <FormField
                control={uploadExternalFileLinkForm.control}
                name={`externalFileLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-1">
                      <FormLabel className="mr-1 min-w-fit">
                        Url
                        {!uploadExternalFileLinkItemSchema.shape.url.isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <Input placeholder="Url" className="w-full" {...field} />
                    </div>
                    <div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={uploadExternalFileLinkForm.control}
                name={`externalFileLinks.${index}.fileName`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-1">
                      <FormLabel className="mr-1 min-w-fit">
                        File name
                        {!uploadExternalFileLinkItemSchema.shape.fileName.isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <Input placeholder="File name" className="w-full" {...field} />
                    </div>
                    <div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div
                className="cursor-pointer rounded-full p-2 hover:bg-slate-200"
                onClick={(e) => {
                  e.preventDefault();
                  formArrayExternalFileLinks.remove(index);
                }}
              >
                <Trash2 />
              </div>
            </div>
          ))}
        </Form>
        <div className="flex justify-end gap-2">
          <Button
            disabled={
              uploadExternalFileLinkState.isUploading ||
              uploadExternalFileLinkForm.getValues('externalFileLinks')?.length === 4
            }
            className="w-fit"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (uploadExternalFileLinkForm.getValues('externalFileLinks').length < 4)
                formArrayExternalFileLinks.append({
                  url: '',
                  fileName: '',
                });
            }}
          >
            New Link
          </Button>
          <Button
            disabled={uploadExternalFileLinkState.isUploading}
            type="submit"
            onClick={uploadExternalFileLinkForm.handleSubmit(handleSaveChanges)}
            className="w-fit bg-primary"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { UploadExternalFileLinkDialog };
