import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage, Input, Label } from 'ui';
import type { ZodObject } from 'zod';

type DialogFormFieldProps = {
  form: UseFormReturn<any>;
  zodSchema: ZodObject<any>;
  name: string;
  placeholder: string;
  label?: string;
};
const DialogFormField = ({ form, zodSchema, name, placeholder, label }: DialogFormFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-left">
              {label || placeholder}
              {!zodSchema.shape[field.name].isOptional() && <span className="text-destructive"> *</span>}
            </Label>
            <FormControl>
              <Input placeholder={placeholder} {...field} className="col-span-3" />
            </FormControl>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <FormMessage className="col-span-3" />
          </div>
        </FormItem>
      )}
    />
  );
};

export { DialogFormField };
