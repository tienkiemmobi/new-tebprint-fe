import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { COUNTRIES, US_STATES } from 'shared';
import {
  AreaLayout,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from 'ui';
import { cn } from 'ui/lib/utils';
import { z } from 'zod';

const OrderShippingShadeSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(3, { message: 'At least 3 characters' })
    .max(40),
  lastName: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .refine((value) => /^\w+([.]?\w+)*@\w+([.-]?\w+)*(\.\w{2,8})+$/.test(value), 'Invalid email')
    .optional(),
  phone: z
    .string({ required_error: 'Phone is required' })
    .regex(/^\d+$/, { message: 'Invalid phone number' })
    .min(8, { message: 'At least 8 characters' })
    .max(15, { message: 'Invalid phone number' })
    .optional(),
  country: z.string({ required_error: 'Country is require!' }),
  state: z.string().trim().optional(),
  address1: z.string({ required_error: 'Address is required' }).trim().min(3, { message: 'At least 3 characters' }),
  address2: z.string().trim().optional(),
  city: z.string({ required_error: 'City is required' }).trim().min(3, { message: 'At least 3 characters' }),
  zipCode: z.string({ required_error: 'ZIP code is required' }).trim().min(3, { message: 'At least 3 characters' }),
});

export const OrderShippingSchema = OrderShippingShadeSchema.extend({}).refine(
  (schema) => (schema.country === 'US' && schema.state !== undefined && schema.state !== '') || schema.country !== 'US',
  {
    message: 'State is required',
    path: ['state'],
  },
);

export type OrderShippingDto = z.infer<typeof OrderShippingSchema>;

export type OrderShippingRef = {
  getFormInfo: () => UseFormReturn<OrderShippingDto>;
  fakeSubmit: () => void;
};

type OrderShippingProps = {};

// eslint-disable-next-line no-empty-pattern
const OrderShipping = forwardRef<OrderShippingRef, OrderShippingProps>(({}, ref) => {
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [isStateRequired, setIsStateRequired] = useState(false);
  const [searchQueryCountry, setSearchQueryCountry] = useState('');

  const orderShippingForm = useForm<OrderShippingDto>({
    resolver: zodResolver(OrderShippingSchema),
    mode: 'all',
  });

  useImperativeHandle(ref, () => ({
    getFormInfo() {
      return orderShippingForm;
    },

    fakeSubmit() {
      submitBtnRef.current?.click();
    },
  }));

  const handleOrderShippingSubmit = () => {};

  const filteredCountries = COUNTRIES.filter((country) => {
    if (!searchQueryCountry) {
      return true;
    }

    return (
      country.name.toLowerCase().includes(searchQueryCountry.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQueryCountry.toLowerCase())
    );
  });

  return (
    <>
      <AreaLayout title="Recipient" titleStyle="py-4">
        <Form {...orderShippingForm}>
          <div className="grid gap-4 md:grid-cols-2 md:pb-2">
            <FormField
              control={orderShippingForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      First name
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="First name" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={orderShippingForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      Last name
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="Last name" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:pb-2">
            <FormField
              control={orderShippingForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      Email
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={orderShippingForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      Phone
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="Phone" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:pb-2">
            <FormField
              control={orderShippingForm.control}
              name="country"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left leading-5">
                      Country
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn('justify-between', !field.value && 'text-muted-foreground')}
                          >
                            {field.value
                              ? COUNTRIES.find((country) => country.code === field.value)?.name
                              : 'Select country'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <Input onChange={(e) => setSearchQueryCountry(e.target.value)} placeholder="Search..." />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-72 w-full rounded-md border">
                              {filteredCountries.map((country) => (
                                <CommandItem
                                  value={country.code}
                                  key={country.code}
                                  onSelect={() => {
                                    field.onChange(country.code);

                                    if (country.code === 'US') {
                                      setIsStateRequired(true);
                                    } else {
                                      setIsStateRequired(false);
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      country.code === field.value ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {country.name} {`(${country.code})`}
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={orderShippingForm.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left leading-5">
                      State <span className="text-sm italic text-stone-400"></span>
                      {isStateRequired && <span className="text-destructive"> *</span>}
                    </Label>

                    {orderShippingForm.getValues('country') === 'US' ? (
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                            >
                              {field.value
                                ? US_STATES.find((usState) => usState.abbreviation === field.value)?.state
                                : 'Select state'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command className="w-full">
                              <CommandInput className="w-full" placeholder="Search..." />
                              <CommandEmpty>No state found.</CommandEmpty>
                              <CommandGroup className="w-[290px]">
                                <ScrollArea className="h-72 w-full rounded-md border">
                                  {US_STATES.map((usState) => (
                                    <CommandItem
                                      key={usState.state}
                                      value={usState.abbreviation}
                                      onSelect={() => {
                                        orderShippingForm.setValue('state', usState.abbreviation);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          usState.state === field.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                      />
                                      {usState.state} {`(${usState.abbreviation})`}
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="mt-2 grid grid-cols-4 items-center gap-4">
                          <FormMessage className="col-span-3" />
                        </div>
                      </div>
                    ) : (
                      <FormControl>
                        <Input placeholder="State" {...field} className="col-span-3" />
                      </FormControl>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={orderShippingForm.control}
            name="address1"
            render={({ field }) => (
              <FormItem className="pb-2">
                <div className="flex flex-col">
                  <Label className="mb-2 text-left">
                    Address line 1
                    {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <FormControl>
                    <Input placeholder="Address line 1" {...field} className="col-span-3" />
                  </FormControl>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <FormMessage className="col-span-3" />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={orderShippingForm.control}
            name="address2"
            render={({ field }) => (
              <FormItem className="pb-2">
                <div className="flex flex-col">
                  <Label className="mb-2 text-left">
                    Address line 2
                    {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <FormControl>
                    <Input placeholder="Address line 2" {...field} className="col-span-3" />
                  </FormControl>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <FormMessage className="col-span-3" />
                </div>
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2 md:pb-2">
            <FormField
              control={orderShippingForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      City
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="City" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={orderShippingForm.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-left">
                      ZIP code
                      {!OrderShippingShadeSchema.shape[field.name].isOptional() && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <FormControl>
                      <Input placeholder="ZIP Code" {...field} className="col-span-3" />
                    </FormControl>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormMessage className="col-span-3" />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <button
            type="submit"
            ref={submitBtnRef}
            className="hidden"
            onClick={orderShippingForm.handleSubmit(handleOrderShippingSubmit)}
          ></button>
        </Form>
      </AreaLayout>
    </>
  );
});

export { OrderShipping };
