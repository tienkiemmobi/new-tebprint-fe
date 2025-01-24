import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { Category } from 'shared';
import {
  Checkbox,
  DeleteConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import { categoryService } from '@/services/category';

import type { CategoriesDialogRef } from './CategoriesDialog';
import { CategoriesDialog } from './CategoriesDialog';

export type CategoryMangerState = {
  category?: Category;
  categories: Category[];
  selectCategory?: Category;
  totalCategory: number;
  isFetchingData: boolean;
};

const Categories: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [categoryManagerState, setCategoryManagerState] = useState<CategoryMangerState>({
    categories: [],
    totalCategory: 0,
    isFetchingData: false,
  });

  const categoriesDialogRef = useRef<CategoriesDialogRef>(null);

  const handleDeleteCategory = async (categoryId: string) => {
    const deleteCategoryResponse = await categoryService.deleteCategory(categoryId);

    if (!deleteCategoryResponse.success || !deleteCategoryResponse.data) {
      toast.error(deleteCategoryResponse.message);

      return;
    }

    toast.success('Delete Category successfully');
    const categoriesResponse = await categoryService.getCategories(pagination);

    if (!categoriesResponse?.success || !categoriesResponse.data) {
      toast.error(categoriesResponse.message);

      return;
    }

    setCategoryManagerState((pre) => ({
      ...pre,
      totalCategory: categoriesResponse.total || 0,
      categories: categoriesResponse.data || [],
    }));
  };

  const columns: ColumnDef<Category>[] = [
    {
      id: 'select',
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
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { name } = row.original;

        return <p category-manager-name="true">{name}</p>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'parent',
      header: 'Parent',
      accessorFn: (row) => row?.parent?.name,
      cell: ({ row }) => <div className="capitalize">{row.getValue('parent')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Create',
    },

    {
      id: 'action',
      accessorKey: 'action',
      header: '',
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setCategoryManagerState((pre) => ({ ...pre, category: row.original }));
                    categoriesDialogRef.current?.triggerOpenDialog();
                  }}
                >
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer text-red-600 hover:bg-secondary"
                >
                  <DeleteConfirmDialog
                    onConfirm={() => handleDeleteCategory(category._id)}
                    target="category"
                  ></DeleteConfirmDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: categoryManagerState.categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(categoryManagerState.totalCategory / pagination.pageSize),
    state: { pagination },
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    (async () => {
      const categoriesResponse = await categoryService.getCategories(pagination);
      if (!categoriesResponse.success || !categoriesResponse.data) {
        toast.error(categoriesResponse.message);

        return;
      }

      setCategoryManagerState((pre) => ({
        ...pre,
        totalCategory: categoriesResponse.total || 0,
        categories: categoriesResponse.data || [],
      }));
      if (!categoriesResponse.data.length || !categoriesResponse.success) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: DEFAULT_PAGINATION.pageIndex,
          pageSize: DEFAULT_PAGINATION.pageSize,
        }));
      }
    })();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Category manager</h2>

        <CategoriesDialog
          ref={categoriesDialogRef}
          setCategoryManagerState={setCategoryManagerState}
          category={categoryManagerState.category}
        />
      </div>
      <div className="mt-6 rounded-sm border bg-white shadow-md">
        <div className="p-5">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
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
                    <TableCell colSpan={columns?.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            name="categories"
            total={categoryManagerState.totalCategory}
            pagination={pagination}
            showInputPagination={{ showInput: true, showTotalOfPage: true }}
            setPagination={setPagination}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            setIsParamLoaded={setIsParamLoaded}
            count={categoryManagerState.categories.length}
          />
        </div>
      </div>
    </div>
  );
};

export { Categories };
