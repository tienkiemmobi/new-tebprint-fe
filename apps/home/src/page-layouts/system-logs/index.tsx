import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import type { SystemLog } from 'shared';
import { Pagination, Search, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import { systemLogService } from '@/services/system-log';

const SystemLogs = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [totalSystemLogs, setTotalSystemLogs] = useState<number>(0);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const handleSearchSystemLog = async (value: string) => {
    setSearchValue(value);
  };

  const columns: ColumnDef<SystemLog>[] = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const { info } = row.original;
        const { user } = info;

        return <b>{user?.fullName || 'Guest'}</b>;
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const { info } = row.original;
        const { action } = info;

        return (
          <p className="flex items-center" system-log-action="true">
            {action}
          </p>
        );
      },
    },
    {
      accessorKey: 'url',
      header: 'Url',
      cell: ({ row }) => {
        const { info } = row.original;
        const { url } = info;

        return <p className="flex items-center">{url}</p>;
      },
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const { info } = row.original;
        const { message } = info;

        return <p className="flex items-center">{message}</p>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const { date } = row.original;

        return <p className="flex items-center">{format(new Date(date), 'HH:mm:ss - dd/MM/yyyy')}</p>;
      },
    },
  ];

  const table = useReactTable({
    data: systemLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    async function fetchSystemLogs() {
      setIsLoading(true);
      const systemLogsResponse = await systemLogService.getSystemLogs(pagination, searchValue);

      if (!systemLogsResponse?.success || !systemLogsResponse.data || !systemLogsResponse.total) {
        setSystemLogs([]);
        setTotalSystemLogs(0);
        setIsLoading(false);
        setIsLoadingTable(false);
        if (systemLogsResponse?.message !== 'Success') {
          toast.error(systemLogsResponse?.message);
        }

        return;
      }

      setIsLoading(false);
      setIsLoadingTable(false);

      setSystemLogs(systemLogsResponse.data);
      setTotalSystemLogs(systemLogsResponse.total);
      if (!systemLogsResponse.data.length || !systemLogsResponse.success) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: DEFAULT_PAGINATION.pageIndex,
          pageSize: DEFAULT_PAGINATION.pageSize,
        }));
      }
    }
    fetchSystemLogs();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">System Logs</h2>
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
            <Search className="mt-0 px-6" placeholder="Search" loading={isLoading} onSearch={handleSearchSystemLog} />
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
                  name="Logs"
                  total={totalSystemLogs}
                  pagination={pagination}
                  showInputPagination={{ showInput: true, showTotalOfPage: true }}
                  setPagination={setPagination}
                  searchValue={searchValue}
                  setIsParamLoaded={setIsParamLoaded}
                  count={systemLogs.length}
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

export { SystemLogs };
