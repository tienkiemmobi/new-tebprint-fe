import type { ColumnDef, CoreRow, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Edit, EyeIcon, Loader2, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Product } from 'shared';
import {
  Button,
  Checkbox,
  DeleteConfirmDialog,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import { productService } from '@/services';

export const ProductManager = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState<string>('');
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isParamLoaded, setIsParamLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const handleSearchProduct = async (value: string) => {
    setSearchValue(value);
  };

  const handleDeleteProduct = async (productId: string) => {
    const deleteProductResponse = await productService.deleteProduct(productId);
    if (!deleteProductResponse?.success || !deleteProductResponse.data) {
      toast.error(deleteProductResponse.message);
    }
    const newProducts = products.filter((item) => item._id !== productId);
    toast.success('Delete product successfully');

    setProducts(newProducts);
  };

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }: { row: CoreRow<Product> }) => {
        const product = row.original;

        return (
          <div className="relative my-4 h-24 min-h-[96px] w-24 cursor-pointer overflow-hidden rounded-[3px] border border-solid border-[#e3e4e5]">
            <img
              className="absolute left-2/4 top-2/4 h-full w-auto translate-x-[-50%] translate-y-[-50%]"
              width="168"
              height="168"
              src={product.mainImage}
            ></img>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const product = row.original;

        return (
          <a href={`/edit-product/${product._id}`}>
            <p className="text-base font-medium leading-6 hover:text-primary" product-manager-title="true">
              {product.title}
            </p>
            <p className="mt-1 text-[#485256]">{product.category.name} </p>
          </a>
        );
      },
    },

    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => {
        const product = row.original;

        return (
          <a href={`/edit-product/${product._id}`}>
            <p className="mt-1 text-[#485256]">{product.productCode} </p>
          </a>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => <div>In Stock</div>,
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex">
            <a href={`/edit-product/${product._id}`} className="inline-block pr-2">
              <button className="h-8 w-8 rounded-[3px] bg-transparent px-[4px] py-[2px] hover:bg-[#17262b1a]">
                <Edit className="inline-block" />
              </button>
            </a>
            <a href={`/product/${product._id}`} className="inline-block pr-2">
              <button className="h-8 w-8 rounded-[3px] bg-transparent px-[4px] py-[2px] hover:bg-[#17262b1a]">
                <EyeIcon className="inline-block" />
              </button>
            </a>
            <DeleteConfirmDialog onConfirm={() => handleDeleteProduct(product._id)} target="product">
              <button className="h-8 w-8 rounded-[3px] bg-transparent px-[4px] py-[2px] hover:bg-[#17262b1a]">
                <Trash className="inline-block" />
              </button>
            </DeleteConfirmDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    (async () => {
      setIsLoading(true);
      const productsResponse = await productService.getProducts(pagination, searchValue);
      if (!productsResponse.success || !productsResponse.data) {
        toast.error(productsResponse.message);

        return;
      }
      setIsLoading(false);
      setIsLoadingTable(false);

      if (!productsResponse) {
        setProducts([]);

        return;
      }

      setProducts(productsResponse.data);
      setTotalProducts(productsResponse.total || 0);
      if (!productsResponse.data.length || !productsResponse.success) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: DEFAULT_PAGINATION.pageIndex,
          pageSize: DEFAULT_PAGINATION.pageSize,
        }));
      }
    })();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  return (
    <>
      <div className="w-full p-4">
        <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
          <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Product Manager</h2>
          <a className="mt-2 block md:mt-0" href="/edit-product/new">
            <Button className="flex-none rounded-[3px]">
              <Plus className="h-5 w-5 pr-1" />
              Create Product
            </Button>
          </a>
        </div>
        <div className="mt-6 h-auto w-full">
          <div className="rounded-sm border bg-white shadow-md">
            <div className="pt-6">
              <Search
                className="mt-0 px-6"
                placeholder="Search"
                searchValue={searchValue}
                loading={isLoading}
                onSearch={handleSearchProduct}
              />
              <div className="p-6">
                <div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="px-6">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      {isLoadingTable ? (
                        <TableBody className="px-6">
                          <TableRow>
                            <TableCell colSpan={productColumns.length} className="h-24 text-center">
                              <div className="flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody className="px-6">
                          {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={productColumns.length} className="h-24 text-center">
                                No results.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      )}
                    </Table>
                  </div>
                  <Pagination
                    name="products"
                    total={totalProducts}
                    pagination={pagination}
                    showInputPagination={{ showInput: true, showTotalOfPage: true }}
                    setPagination={setPagination}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    setIsParamLoaded={setIsParamLoaded}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
