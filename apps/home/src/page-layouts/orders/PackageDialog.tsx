import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
} from 'ui';
import { cn } from 'ui/lib/utils';
import { ZodError } from 'zod';

import type { PackageOrderDto } from '@/interfaces';
import { PackageOrderZodSchema } from '@/interfaces';

type PackageDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onosSkus?: { sku: string; name: string; id: string; weight: number; width: number; height: number; length: number }[];
  onosSkuValue?: string;
  onOnosSkuChange?: (value: string) => void;
  onSubmit: (
    data: PackageOrderDto & { onosProductId?: string; onosProductSku?: string; onosProductName?: string },
  ) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  title?: string;
};

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

export const PackageDialog = ({
  open,
  onOpenChange,
  onosSkus = [],
  onosSkuValue = '',
  onOnosSkuChange,
  onSubmit,
  isLoading = false,
  trigger,
  title = 'Package Order',
}: PackageDialogProps) => {
  const [onosSkuComboboxOpen, setOnosSkuComboboxOpen] = useState(false);
  const [internalOnosSkuValue, setInternalOnosSkuValue] = useState(onosSkuValue);

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

  const packageOrderForm = useForm<PackageOrderDto>({
    resolver: zodResolver(PackageOrderZodSchema),
    defaultValues: packageOrderDefaultValues,
    mode: 'all',
  });

  const currentOnosSkuValue = onosSkuValue || internalOnosSkuValue;

  useEffect(() => {
    if (!currentOnosSkuValue) {
      return;
    }
    const onosSku = onosSkus.find(
      (myOnosSku) => myOnosSku.sku.toLowerCase() === currentOnosSkuValue.split('-')[0]?.trim(),
    );

    if (onosSku) {
      packageOrderForm.setValue('weight', onosSku.weight || 0);
      packageOrderForm.setValue('height', onosSku.height || 0);
      packageOrderForm.setValue('width', onosSku.width || 0);
      packageOrderForm.setValue('length', onosSku.length || 0);
    }
  }, [currentOnosSkuValue, onosSkus]);

  useEffect(() => {
    const currentPackage = tebPackages.find((myPackage) => myPackage.id === packageOrderForm.watch('packageId'));

    if (!currentPackage) {
      return;
    }

    packageOrderForm.setValue('weight', currentPackage.weight);
    packageOrderForm.setValue('height', currentPackage.height);
    packageOrderForm.setValue('width', currentPackage.width);
    packageOrderForm.setValue('length', currentPackage.length);
  }, [packageOrderForm.watch('packageId')]);

  const handleSubmit = () => {
    try {
      const validValues = PackageOrderZodSchema.parse(packageOrderForm.getValues());
      const onosSku = onosSkus.find(
        (myOnosSku) => myOnosSku.sku.toLowerCase() === currentOnosSkuValue.split('-')[0]?.trim(),
      );

      onSubmit({
        ...validValues,
        onosProductId: onosSku?.id,
        onosProductSku: onosSku?.sku,
        onosProductName: onosSku?.name,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        if (firstIssue) {
          toast.error(`${firstIssue.path.join('.')} ${firstIssue.message}`);
        }
      }
    }
  };

  const handleOnosSkuSelect = (value: string) => {
    setInternalOnosSkuValue(value);
    onOnosSkuChange?.(value);
    setOnosSkuComboboxOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange?.(value);
        if (!value) {
          packageOrderForm.setValue('skipAddressCheck', false);
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {onosSkus.length > 0 && (
          <div className="mb-4">
            <Popover open={onosSkuComboboxOpen} onOpenChange={setOnosSkuComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={onosSkuComboboxOpen}
                  className="w-full justify-between"
                >
                  {currentOnosSkuValue.split('-')[0]?.trim() || 'Select Onos SKU...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Select Onos SKU..." />
                  <CommandEmpty>No SKU found.</CommandEmpty>
                  <CommandGroup className="h-[300px] overflow-y-scroll">
                    {onosSkus.map((sku) => (
                      <CommandItem
                        key={sku.sku}
                        value={`${sku.sku} - ${sku.name}`}
                        onSelect={(currentValue) => {
                          handleOnosSkuSelect(currentValue);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            currentOnosSkuValue.split('-')[0]?.trim() === sku.sku ? 'opacity-100' : 'opacity-0',
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
        )}
        <Form {...packageOrderForm}>
          <div className="grid gap-4 py-4">
            <FormField
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
                        {shippingServices.map((service) => {
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
                        {tebPackages.map((tebPackage) => {
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
                        value={field.value || ''}
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
                        value={field.value || ''}
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
                        value={field.value || ''}
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
                        value={field.value || ''}
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
                          field.onChange(e.target.checked);
                        }}
                        checked={field.value}
                        type="checkbox"
                        required={true}
                        className="resize-none"
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
                          field.onChange(e.target.checked);
                        }}
                        checked={field.value}
                        type="checkbox"
                        required={true}
                        className="resize-none"
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
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
