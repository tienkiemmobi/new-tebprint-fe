import type { ColumnDef, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ProductVariant } from 'shared';
import { Status } from 'shared';
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import type { NewProductVariantDto } from '@/interfaces';

import { EditVariantsDialog } from './EditVariantsDialog';
import type { EditProductState } from './index';

declare module '@tanstack/react-table' {
  // @ts-ignore
  interface TableMeta {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type EditProductTableProps = {
  variants: ProductVariant[];
  setEditProductState: React.Dispatch<React.SetStateAction<EditProductState>>;
  isCreateNewProduct: boolean;
  order: Array<keyof OptionsMap>;
};

export type OptionsMap = Record<'color' | 'size' | 'style', string[]>;

export function EditProductTable({ isCreateNewProduct, variants, setEditProductState, order }: EditProductTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isUpdateVariantsDialogOpen, setIsUpdateVariantsDialogOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState({});
  const [isUpdatePriceDialogOpen, setIsUpdatePriceDialogOpen] = useState(false);
  const [isUpdateUsPriceDialogOpen, setIsUpdateUsPriceDialogOpen] = useState(false);
  const [isUpdateVnShipPriceDialogOpen, setIsUpdateVnShipPriceDialogOpen] = useState(false);
  const [isUpdateUsShipPriceDialogOpen, setIsUpdateUsShipPriceDialogOpen] = useState(false);
  const [isUpdateBaseCostDialogOpen, setIsUpdateBaseCostDialogOpen] = useState(false);
  const [isUpdateQuantityDialogOpen, setIsUpdateQuantityDialogOpen] = useState(false);

  const priceInput = useRef<HTMLInputElement>(null!);
  const usPriceInput = useRef<HTMLInputElement>(null!);
  const vnShipPriceInput = useRef<HTMLInputElement>(null!);
  const usShipPriceInput = useRef<HTMLInputElement>(null!);
  const baseCostInput = useRef<HTMLInputElement>(null!);
  const quantityInput = useRef<HTMLInputElement>(null!);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function getUniqueValues(variants: NewProductVariantDto[], field: 'color' | 'size' | 'style'): string[] {
    const uniqueValues = new Set<string>();

    variants.forEach((item) => {
      uniqueValues.add(item[field] as string);
    });

    return Array.from(uniqueValues);
  }

  const optionsMapInitial: OptionsMap = isCreateNewProduct
    ? {
        color: ['Single'],
        size: ['Single'],
        style: ['Single'],
      }
    : {
        color: getUniqueValues(variants, 'color'),
        size: getUniqueValues(variants, 'size'),
        style: getUniqueValues(variants, 'style'),
      };

  const [optionsMap, setOptionsMap] = useState<OptionsMap>(optionsMapInitial);
  const [propertyOrder, setPropertyOrder] = useState<Array<keyof OptionsMap>>(
    order && order.length ? order : ['size', 'color', 'style'],
  );

  const handleOpenUpdateVariantsDialog = () => {
    setIsUpdateVariantsDialogOpen(true);
  };

  const handleUpdateVariants = () => {
    setIsUpdateVariantsDialogOpen(false);

    const newVariants: NewProductVariantDto[] = [];

    // create new variants by loop through all option key color, size, style
    optionsMap['color' as keyof OptionsMap].forEach((color) => {
      optionsMap['size' as keyof OptionsMap].forEach((size) => {
        optionsMap['style' as keyof OptionsMap].forEach((style) => {
          newVariants.push({
            color,
            size,
            style,
            description: '',
            price: 0,
            usPrice: 0,
            vnShipPrice: 0,
            usShipPrice: 0,
            baseCost: 1.1,
            quantity: 10000,
            sku: '',
            status: Status.Active,
          });
        });
      });
    });

    // compare with the old variants and update old data to the new
    variants.forEach((item) => {
      newVariants.forEach((newVariant, index) => {
        if (newVariant.color === item.color && newVariant.size === item.size && newVariant.style === item.style) {
          newVariants[index] = item;
        }
      });
    });

    setEditProductState((prev: EditProductState) => {
      return {
        ...prev,
        variants: newVariants.sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
        propertyOrder,
      };
    });
  };

  const editableColumns = ['price', 'usPrice', 'vnShipPrice', 'usShipPrice', 'baseCost', 'quantity'];
  const withCurrencyColumns = ['price', 'usPrice', 'vnShipPrice', 'usShipPrice', 'baseCost'];
  const defaultColumn: Partial<ColumnDef<ProductVariant>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      if (editableColumns.includes(id)) {
        const onBlur = () => {
          setValue(value);
          table.options.meta?.updateData(index, id, value);
          setEditProductState((prev: EditProductState) => {
            return {
              ...prev,
              variants: [
                ...prev.variants.slice(0, index),
                {
                  ...prev.variants[index],
                  [id]: value,
                },
                ...prev.variants.slice(index + 1),
              ].sort((a: any, b: any) => {
                const sizeA = parseInt(a.size, 10);
                const sizeB = parseInt(b.size, 10);

                return sizeA - sizeB;
              }),
            };
          });
        };

        if (withCurrencyColumns.includes(id)) {
          return (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)' }}>$</span>
              <Input type="number" value={value as string} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />
            </div>
          );
        }

        return (
          <Input type="number" value={value as string} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />
        );
      }

      return value;
    },
  };

  const columns: ColumnDef<ProductVariant>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
    },
    ...propertyOrder.map((key) => ({ accessorKey: key, header: () => <div className="capitalize">{key}</div> })),
    {
      accessorKey: 'sku',
      header: 'Sku',
    },
    {
      accessorKey: 'baseCost',
      header: 'Base cost',
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'usPrice',
      header: 'US Price',
    },
    {
      accessorKey: 'vnShipPrice',
      header: 'VN Ship Price',
    },
    {
      accessorKey: 'usShipPrice',
      header: 'US Ship Price',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.status === 'active'}
            onCheckedChange={(value) => {
              const newStatus = value ? 'active' : 'inactive';
              setEditProductState((prev: EditProductState) => {
                return {
                  ...prev,
                  variants: prev.variants
                    .map((item) => {
                      if (
                        item.color === row.original.color &&
                        item.size === row.original.size &&
                        item.style === row.original.style
                      ) {
                        return {
                          ...item,
                          status: newStatus,
                        };
                      }

                      return item;
                    })
                    .sort((a: any, b: any) => {
                      const sizeA = parseInt(a.size, 10);
                      const sizeB = parseInt(b.size, 10);

                      return sizeA - sizeB;
                    }),
                };
              });
            }}
          ></Switch>
        );
      },
    },
  ];

  const table = useReactTable({
    data: variants,
    columns,
    defaultColumn,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleUpdatePrice = () => {
    const price = Number(priceInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              price,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdatePriceDialogOpen(false);
  };

  const handleUpdateUsPrice = () => {
    const usPrice = Number(usPriceInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              usPrice,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdateUsPriceDialogOpen(false);
  };

  const handleUpdateVnShipPrice = () => {
    const vnShipPrice = Number(vnShipPriceInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              vnShipPrice,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdateVnShipPriceDialogOpen(false);
  };

  const handleUpdateUsShipPrice = () => {
    const usShipPrice = Number(usShipPriceInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              usShipPrice,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdateUsShipPriceDialogOpen(false);
  };

  const handleUpdateBaseCost = () => {
    const baseCost = Number(baseCostInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              baseCost,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdateBaseCostDialogOpen(false);
  };

  const handleUpdateQuantity = () => {
    const quantity = Number(quantityInput.current.value);

    setEditProductState((prev) => ({
      ...prev,
      variants: prev.variants
        .map((variant, index) => {
          if (Object.keys(rowSelection).includes(String(index))) {
            return {
              ...variant,
              quantity,
            };
          }

          return variant;
        })
        .sort((a: any, b: any) => {
          const sizeA = parseInt(a.size, 10);
          const sizeB = parseInt(b.size, 10);

          return sizeA - sizeB;
        }),
    }));

    setIsUpdateQuantityDialogOpen(false);
  };

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div>
            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              className="mr-2"
              variant="outline"
              onClick={() => setIsUpdatePriceDialogOpen(true)}
            >
              Update Price
            </Button>

            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              className="mr-2"
              variant="outline"
              onClick={() => setIsUpdateUsPriceDialogOpen(true)}
            >
              Update US Price
            </Button>

            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              className="mr-2"
              variant="outline"
              onClick={() => setIsUpdateVnShipPriceDialogOpen(true)}
            >
              Update VN Ship Price
            </Button>

            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              className="mr-2"
              variant="outline"
              onClick={() => setIsUpdateUsShipPriceDialogOpen(true)}
            >
              Update US Ship Price
            </Button>

            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              variant="outline"
              onClick={() => setIsUpdateBaseCostDialogOpen(true)}
            >
              Update Base Cost
            </Button>

            <Button
              {...{ disabled: Object.keys(rowSelection).length === 0 }}
              variant="outline"
              onClick={() => setIsUpdateQuantityDialogOpen(true)}
            >
              Update Quantity
            </Button>
          </div>
          <div>
            <Button className="mr-2" variant="outline" onClick={() => handleOpenUpdateVariantsDialog()}>
              Edit Variants
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="underline">
                <Eye className="inline" /> Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel></DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditVariantsDialog
        optionsMap={optionsMap}
        setOptionsMap={setOptionsMap}
        propertyOrder={propertyOrder}
        setPropertyOrder={setPropertyOrder}
        isUpdateVariantsDialogOpen={isUpdateVariantsDialogOpen}
        handleUpdateVariants={handleUpdateVariants}
        setIsUpdateVariantsDialogOpen={setIsUpdateVariantsDialogOpen}
      ></EditVariantsDialog>

      <Dialog open={isUpdatePriceDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update price for {Object.keys(rowSelection).length} variant{Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={priceInput} className="mb-4" placeholder="Price" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdatePrice();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdatePriceDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateUsPriceDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update US price for {Object.keys(rowSelection).length} variant
              {Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={usPriceInput} className="mb-4" placeholder="Price" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdateUsPrice();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateUsPriceDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateVnShipPriceDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update VN Ship price for {Object.keys(rowSelection).length} variant
              {Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={vnShipPriceInput} className="mb-4" placeholder="Price" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdateVnShipPrice();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateVnShipPriceDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateUsShipPriceDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update US Ship price for {Object.keys(rowSelection).length} variant
              {Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={usShipPriceInput} className="mb-4" placeholder="Price" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdateUsShipPrice();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateUsShipPriceDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateBaseCostDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update base cost for {Object.keys(rowSelection).length} variant
              {Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={baseCostInput} className="mb-4" placeholder="Base Cost" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdateBaseCost();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateBaseCostDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateQuantityDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>
              Update quantity for {Object.keys(rowSelection).length} variant
              {Object.keys(rowSelection).length > 1 && 's'}
            </DialogTitle>
          </DialogHeader>

          <div style={{ position: 'relative' }}>
            <Input type="number" ref={quantityInput} className="mb-4" placeholder="Quantity" />
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                handleUpdateQuantity();
              }}
            >
              Update
            </Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateQuantityDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
