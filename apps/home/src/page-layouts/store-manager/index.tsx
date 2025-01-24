import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Dot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Status } from 'shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Pagination,
  Search,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { Store } from '@/interfaces';
import { storeService } from '@/services';

const StoreManager = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [totalStores, setTotalStores] = useState<number>(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const handleSearchStore = async (value: string) => {
    setSearchValue(value);
  };

  const handleSwitch = async (storeId: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? Status.Inactive : Status.Active;
    const updatedStores = stores.map((store) => {
      if (store._id === storeId) {
        return { ...store, status: newStatus };
      }

      return store;
    });

    // Set the state with the updated array
    setStores(updatedStores);
    const updatedStore = await storeService.updateStore({ status: newStatus }, storeId);
    if (!updatedStore.success || !updatedStore.data) {
      toast.error(updatedStore.message);

      return;
    }
    toast.success('Update store successfully');
  };

  const columns: ColumnDef<Store>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return <b store-manager-name="true">{row.getValue('name')}</b>;
      },
    },
    {
      accessorKey: 'owner',
      header: 'owner',
      cell: ({ row }) => {
        const { owner } = row.original;

        return <p className="flex items-center">{owner}</p>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status } = row.original;

        return (
          <p className="flex items-center">
            {status === Status.Active ? (
              <Dot color="#03fc1c" strokeWidth={10} fill="#03fc1c" />
            ) : (
              <Dot color="#e61919" strokeWidth={10} fill="#e61919" />
            )}
            {status.toUpperCase()}
          </p>
        );
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: '',
      cell: ({ row }) => {
        const store = row.original;
        const isActive = store.status === Status.Active;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="flex items-center">
                <Switch checked={isActive} className="mr-2" onCheckedChange={() => handleSwitch(store._id, isActive)} />{' '}
                {` ${store.status.toLowerCase()}`}
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: stores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    async function fetchStores() {
      setIsLoading(true);
      const storesResponse = await storeService.getStores(pagination, searchValue);

      if (!storesResponse?.success || !storesResponse.data || !storesResponse.total) {
        toast.error(storesResponse?.message);

        return;
      }
      setIsLoading(false);
      setIsLoadingTable(false);

      setStores(storesResponse.data);
      setTotalStores(storesResponse.total);
      if (!storesResponse.data.length || !storesResponse.success) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: DEFAULT_PAGINATION.pageIndex,
          pageSize: DEFAULT_PAGINATION.pageSize,
        }));
      }
    }
    fetchStores();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Store Manager</h2>
        {/* <Button
              className={`flex-none space-x-1 rounded-[3px]`}
              disabled={isSyncing}
              onClick={() => setIsSyncing(true)}
            >
              <RefreshCcw className={`${isSyncing ? 'animate-spin' : ''}`} />
            </Button> */}
      </div>
      <div className="mt-6 h-auto w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="pt-6">
            <Search className="mt-0 px-6" placeholder="Search" loading={isLoading} onSearch={handleSearchStore} />
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
                          <TableCell colSpan={columns.length} className="h-24 text-center">
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
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    )}
                  </Table>
                </div>
                <Pagination
                  name="Template"
                  total={totalStores}
                  pagination={pagination}
                  showInputPagination={{ showInput: true, showTotalOfPage: true }}
                  setPagination={setPagination}
                  searchValue={searchValue}
                  setIsParamLoaded={setIsParamLoaded}
                  count={stores.length}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export { StoreManager };
