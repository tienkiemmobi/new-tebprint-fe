import { AlertCircle, ArrowLeft, Download, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';
import { ORDER_DETAIL, ORDER_ERROR, toCamelCaseKey } from 'shared';
import { Alert, AlertDescription, Button, TebToastContainer } from 'ui';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import type { OrdersImportItemDto } from '@/interfaces';
import { productVariantService } from '@/services';

import { OrdersImportProgress } from './OrdersImportProgress';
import { OrdersImportTable } from './OrdersImportTable';

export const OrdersImportZod = z
  .object({
    externalId: z
      .string()
      .trim()
      .min(3)
      .max(20)
      .refine((value) => /^[^\s]+$/.test(value), "External ID can't have space"),
    designerName: z.string().trim().optional(),
    shippingMethod: z
      .enum(['Standard', 'Express'], {
        errorMap: (issue, _ctx) => {
          switch (issue.code) {
            case 'invalid_enum_value':
              return { message: 'Expected Standard or Express' };
            default:
              return { message: 'Expected Standard or Express' };
          }
        },
      })
      .optional(),
    firstName: z.string().trim().min(3).max(40),
    lastName: z.string().trim().min(3).max(40).optional(),
    email: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .refine((value) => /^\w+([.]?\w+)*@\w+([.-]?\w+)*(\.\w{2,8})+$/.test(value), 'Invalid email')
      .optional(),
    phone: z.string().trim().min(8).max(32).optional(),
    country: z.string().trim().min(2).max(20),
    region: z.string().trim().min(2).max(40),
    addressLine1: z.string().trim().min(2).max(100),
    addressLine2: z.string().trim().min(2).max(100).optional(),
    city: z.string().trim().min(2).max(40),
    zip: z.string().trim().min(1).max(10),
    quantity: z
      .string()
      .trim()
      .min(1)
      .max(3)
      .refine((value) => /^\d+$/.test(value), 'Quantity must be number'),
    variantId: z.string().trim().min(3).max(30),
    frontArtworkUrl: z.string().trim().min(10).max(256).optional(),
    backArtworkUrl: z.string().trim().min(10).max(256).optional(),
    mockupUrl1: z.string().trim().min(10).max(256).optional(),
    mockupUrl2: z.string().trim().min(10).max(256).optional(),
    storeCode: z.string().trim().min(3).max(20).optional(),
    labelUrl: z.string().trim().min(10).max(255).optional(),
  })
  .superRefine((data, ctx) => {
    const isLabelShipping = !!data.labelUrl;

    if (!isLabelShipping) {
      if (!data.firstName) {
        ctx.addIssue({
          code: 'custom',
          message: 'First name is required for normal shipping',
          path: ['firstName'],
        });
      }

      if (!data.addressLine1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 1 is required for normal shipping',
          path: ['addressLine1'],
        });
      }

      if (!data.country) {
        ctx.addIssue({
          code: 'custom',
          message: 'Country is required for normal shipping',
          path: ['country'],
        });
      }

      if (!data.region && data.country === 'US') {
        ctx.addIssue({
          code: 'custom',
          message: 'Region is required for normal shipping and country US',
          path: ['region'],
        });
      }

      if (!data.city) {
        ctx.addIssue({
          code: 'custom',
          message: 'City is required for normal shipping',
          path: ['city'],
        });
      }

      if (!data.zip) {
        ctx.addIssue({
          code: 'custom',
          message: 'Zip is required for normal shipping',
          path: ['zip'],
        });
      }
    }
  })
  .array();

type OrdersImportState = {
  ordersData: OrdersImportItemDto[];
  csvContent: string;
  state: 'init' | 'pending' | 'success' | 'rejected';
  fileName: string;
  error: string;
};

const initOrdersImportState: OrdersImportState = {
  ordersData: [],
  csvContent: ',',
  state: 'init',
  fileName: '',
  error: '',
};

// const isDuplicateVariantId = (ordersData: OrdersImportItemDto[]): boolean => {
//   const variantIdSet = new Set<string>();

//   for (let i = 0; i < ordersData.length; i += 1) {
//     const orderItem = ordersData[i];
//     if (!orderItem) break;
//     const { variantId } = orderItem;

//     if (variantIdSet.has(variantId)) {
//       return true;
//     }

//     variantIdSet.add(variantId);
//   }

//   return false;
// };

const OrdersImport = () => {
  const inputFileRef = React.useRef<HTMLInputElement>(null);
  const isCancelImportingRef = React.useRef(false);
  const [ordersImportState, setOrdersImportState] = React.useState<OrdersImportState>(initOrdersImportState);
  const [hasError, setHasError] = React.useState(false);

  const readFileAsArrayBuffer = React.useCallback((file: File) => {
    return new Promise<{ ordersData: OrdersImportItemDto[]; csvContent: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (onloadEvent) => {
        try {
          const csvContent = onloadEvent.target?.result as string;
          const workbook = XLSX.read(onloadEvent.target?.result, { type: 'string' });
          const jsonFormat = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1 as XLSX.WorkSheet);
          console.log('🚀 ~ readFileAsArrayBuffer ~ jsonFormat:', jsonFormat);
          const ordersData = jsonFormat.map((item) =>
            toCamelCaseKey(item as Record<string, any>),
          ) as OrdersImportItemDto[];
          resolve({ ordersData, csvContent });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (errorEvent) => {
        reject(errorEvent.target?.error);
      };
      reader.readAsText(file);
    });
  }, []);

  const handleInputChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    isCancelImportingRef.current = false;
    if (!e.target.files) return;
    const file = e.target.files[0];

    if (!file) return;

    setOrdersImportState((pre) => ({
      ...pre,
      fileName: file.name,
      state: 'pending',
    }));
    try {
      const { ordersData, csvContent } = await readFileAsArrayBuffer(file);
      const result = OrdersImportZod.safeParse(ordersData);
      console.log('🚀 ~ handleInputChange ~ result:', result);
      let isValid = true;

      if (!result.success) {
        setHasError(true);
        isValid = false;
        result.error.issues.forEach((issue) => {
          const [orderErrorIndex, orderErrorKey] = issue.path;

          if (orderErrorKey) {
            const orderDataItem = ordersData[Number(orderErrorIndex)];

            if (orderDataItem) {
              orderDataItem[orderErrorKey as keyof OrdersImportItemDto] += `|${ORDER_ERROR}_${issue.message}`;
            }
          }
        });
      }

      // const isDuplicate = isDuplicateVariantId(ordersData);

      // if (isDuplicate) {
      //   toast.error('This variant you already added to the order');
      //   e.target.value = '';

      //   return;
      // }

      const orderVariantIds: string[] = ordersData.map((item) => item.variantId);
      const uniqueVariantIds: string[] = [...new Set(orderVariantIds)];

      const variants = await productVariantService.getProductVariantsByCodes(uniqueVariantIds);

      if (variants.data) {
        ordersData.forEach((order) => {
          const variant = variants.data?.find((item) => item.id === order.variantId);
          if (!variant) return;

          if (variant.data) {
            order.variantId += `|${ORDER_DETAIL}_${variant.data.name} ${variant.data.color} ${variant.data.size} ${variant.data.style}`;
          } else {
            isValid = false;
            order.variantId += `|${ORDER_ERROR}_Invalid Variant ID`;
          }
        });

        if (!isCancelImportingRef.current)
          setOrdersImportState((pre) => ({
            ...pre,
            ordersData,
            csvContent,
            fileName: '',
            state: isValid ? 'success' : 'rejected',
            error: '',
          }));
      } else {
        toast.error(variants.message);
        if (!isCancelImportingRef.current)
          setOrdersImportState((pre) => ({ ...pre, fileName: '', state: 'rejected', error: '' }));
      }
    } catch (error) {
      if (!isCancelImportingRef.current)
        setOrdersImportState((pre) => ({
          ...pre,
          fileName: '',
          state: 'rejected',
          error: (error as string) || 'Failed to parse uploaded CSV file. Please check file structure',
        }));
      toast.error((error as string) || 'Failed to parse uploaded CSV file. Please check file structure');
    }

    e.target.value = '';
  }, []);

  const resetOrder = () => {
    setOrdersImportState(() => initOrdersImportState);
  };

  const handleCancelImporting = () => {
    isCancelImportingRef.current = true;

    resetOrder();
  };

  return (
    <>
      <div className="w-full p-4">
        <div className="mx-auto my-10 w-full max-w-[1150px] bg-transparent px-4">
          <div className="mb-6">
            <a href="/orders" className="mb-3 flex items-center gap-1">
              <ArrowLeft />
              <span className="text-base">Back to Orders</span>
            </a>
            <h2 className="text-[1.75rem] font-bold leading-10 md:text-[2rem]">CSV Orders Import</h2>
          </div>

          <div className="mt-4 flex flex-col rounded-[3px] border border-[#e3e4e5] bg-background p-6">
            {ordersImportState.error && (
              <Alert variant="destructive" className="mb-4 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                <AlertDescription>{ordersImportState.error}</AlertDescription>
              </Alert>
            )}

            {ordersImportState.state === 'pending' && (
              <div>
                <div className="mb-6 flex items-center justify-evenly rounded-[3px] border border-[#e3e4e5] bg-background p-8">
                  <p className="max-w-[20%] truncate underline decoration-[#686f71] decoration-dashed underline-offset-[5px]">
                    {ordersImportState.fileName}
                  </p>
                  <OrdersImportProgress isDone={ordersImportState.ordersData.length > 0} />
                  <Button variant="ghost" onClick={handleCancelImporting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-10 flex items-center justify-center gap-4">
                  <span className="dsy-loading dsy-loading-spinner dsy-loading-md"></span>
                  <div>
                    <p> Processing your file... </p>
                    <p> This may take a minute </p>
                  </div>
                </div>
              </div>
            )}

            {ordersImportState.ordersData.length === 0 && ordersImportState.state !== 'pending' && (
              <>
                <div className="flex h-[30ordersData0px] max-h-[300px] flex-col items-center justify-center gap-2 border border-dashed border-[#c4c7c8]">
                  <Download className="h-12 w-12" strokeWidth={1} />
                  <p>Drag and drop your file here or</p>
                  <Button onClick={() => inputFileRef.current?.click()}>Browse</Button>
                  <input type="file" hidden ref={inputFileRef} accept=".csv" onChange={handleInputChange} />
                  <p className="text-[#9fa4a5]">CSV files up to 10 MB allowed.</p>
                </div>

                <div className="mt-6">
                  <h5 className="mb-4 text-xl font-bold">Helpful links</h5>
                  <p className="mb-2">
                    <a
                      href="https://docs.google.com/spreadsheets/d/1On2f0om_Fbz6Nm1N3j2iOgIzvcB9TxyzDHRdL5xdskY/edit#gid=0"
                      target="_blank"
                      className="text-[#29ab51]"
                    >
                      CSV template
                    </a>
                    <span className="ml-2">Updated {new Date().toLocaleDateString()}</span>
                  </p>
                  <p className="mb-2">
                    <a
                      href={`${import.meta.env.PUBLIC_API_URL}/products/export?type=XLSX`}
                      target="_blank"
                      className="text-[#29ab51]"
                    >
                      All product variants information
                    </a>
                    <span className="ml-2">Updated {new Date().toLocaleDateString()}</span>
                  </p>
                </div>
              </>
            )}

            {ordersImportState.ordersData.length > 0 && (
              <OrdersImportTable
                data={ordersImportState.ordersData}
                csvContent={ordersImportState.csvContent}
                hasError={hasError}
                resetOrder={resetOrder}
              ></OrdersImportTable>
            )}
          </div>
        </div>
        <TebToastContainer />
      </div>
    </>
  );
};

export { OrdersImport };
