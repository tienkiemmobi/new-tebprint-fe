import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Eye, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Button, Pagination, Search, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { MailTemplateDto } from '@/interfaces';
import { mailService } from '@/services';

const MailManager = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalTemplates, setTotalTemplates] = useState<number>(0);
  const [templates, setTemplates] = useState<MailTemplateDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);

  const handleSearchTemplate = async (value: string) => {
    setSearchValue(value);
  };

  const columns: ColumnDef<MailTemplateDto>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        return <b mail-manager-title="true">{row.getValue('title')}</b>;
      },
    },
    {
      accessorKey: 'lastEditedTime',
      header: 'Last Edited',
      cell: ({ row }) => {
        const date = new Date(row.getValue('lastEditedTime'))
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '-');

        return date;
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: '',
      cell: ({ row }) => {
        const template = row.original;

        return (
          <Eye
            onClick={() => {
              dialogTriggerRef.current?.click();

              setTimeout(() => {
                if (iframeRef.current)
                  iframeRef.current.src = `data:text/html;charset=utf-8,${escape(template.content)}`;
                if (dialogTitleRef.current) dialogTitleRef.current.innerHTML = template.title;
              }, 100);
            }}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  // useEffect for syncing templates
  useEffect(() => {
    if (isSyncing) {
      (async () => {
        const syncTemplatesResponse = await mailService.syncTemplates();
        setIsSyncing(false);

        if (!syncTemplatesResponse.success || !syncTemplatesResponse.data) {
          toast.error(syncTemplatesResponse.message);
        }
      })();
    }
  }, [isSyncing]);

  // useEffect for fetching mail templates
  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    if (!isSyncing) {
      (async () => {
        setIsLoading(true);
        const mailTemplateResponse = await mailService.getMailTemplates(pagination, searchValue);
        setIsLoading(false);
        setIsLoadingTable(false);

        if (
          !mailTemplateResponse.success ||
          !mailTemplateResponse.data ||
          (!mailTemplateResponse.total && mailTemplateResponse.total !== 0)
        ) {
          toast.error(mailTemplateResponse.message);

          return;
        }

        setTemplates(mailTemplateResponse.data);
        setTotalTemplates(mailTemplateResponse.total);
        if (!mailTemplateResponse.data.length || !mailTemplateResponse.success) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: DEFAULT_PAGINATION.pageIndex,
            pageSize: DEFAULT_PAGINATION.pageSize,
          }));
        }
      })();
    }
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded, isSyncing]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Mail Manager</h2>
        <Button className={`flex-none space-x-1 rounded-[3px]`} disabled={isSyncing} onClick={() => setIsSyncing(true)}>
          <RefreshCcw className={`${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="mt-6 h-auto w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="pt-6">
            <Search className="mt-0 px-6" placeholder="Search" loading={isLoading} onSearch={handleSearchTemplate} />
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
                  total={totalTemplates}
                  pagination={pagination}
                  showInputPagination={{ showInput: true, showTotalOfPage: true }}
                  setPagination={setPagination}
                  searchValue={searchValue}
                  setIsParamLoaded={setIsParamLoaded}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      <Dialog>
        <DialogTrigger ref={dialogTriggerRef}></DialogTrigger>
        <DialogContent className="flex h-1/2 flex-col lg:min-w-[750px]">
          <p className="h-6 text-base font-bold" ref={dialogTitleRef}></p>
          <iframe ref={iframeRef} className="h-full w-full"></iframe>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { MailManager };
