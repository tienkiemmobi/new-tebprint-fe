import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Eye, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Pagination, Search, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { Blog } from '@/interfaces';
import { blogService } from '@/services/blog';

const BlogManager = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const handleEyeClick = (blogSlug: string) => {
    window.open(`/blogs/${blogSlug}`, '_blank');
  };

  const handleSearchBlog = async (value: string) => {
    setSearchValue(value);
  };

  const columns: ColumnDef<Blog>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        return <b blog-manager-title="true">{row.getValue('title')}</b>;
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags: string[] = row.getValue('tags');

        return <div>{tags.toString()}</div>;
      },
    },
    {
      accessorKey: 'lastEditedTime',
      header: 'Last updated',
      cell: ({ row }) => {
        const date = new Date(row.getValue('lastEditedTime'))
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(/\//g, '-');

        return date;
      },
    },
    {
      accessorKey: 'slug',
      header: 'slug',
      cell: ({ row }) => {
        return row.getValue('slug');
      },
    },
    {
      id: 'action',
      accessorKey: 'action',
      header: '',
      cell: ({ row }) => {
        const blog = row.original;

        return (
          <button onClick={() => handleEyeClick(blog.slug)} aria-label={`View ${blog.slug}`}>
            <Eye />
          </button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: blogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  // useEffect for syncing blogs
  useEffect(() => {
    if (isSyncing) {
      (async () => {
        const syncResponse = await blogService.sync();
        setIsSyncing(false);

        if (!syncResponse.success || !syncResponse.data) {
          toast.error(syncResponse.message);
        }
      })();
    }
  }, [isSyncing]);

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    if (!isSyncing) {
      (async () => {
        setIsLoading(true);
        const blogResponse = await blogService.getBlogs(pagination);
        setIsLoading(false);
        setIsLoadingTable(false);

        if (!blogResponse.success || !blogResponse.data || (!blogResponse.total && blogResponse.total !== 0)) {
          toast.error(blogResponse?.message);

          return;
        }

        setBlogs(blogResponse.data);
        setTotalBlogs(blogResponse.total);

        if (!blogResponse.data.length || !blogResponse.success) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: DEFAULT_PAGINATION.pageIndex,
            pageSize: DEFAULT_PAGINATION.pageSize,
          }));
        }
      })();
    }
  }, [pagination.pageIndex, pagination.pageSize, isParamLoaded, searchValue, isSyncing]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Blog Manager</h2>
        <Button className={`flex-none space-x-1 rounded-[3px]`} disabled={isSyncing} onClick={() => setIsSyncing(true)}>
          <RefreshCcw className={`${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="mt-6 h-auto w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="pt-6">
            <Search className="mt-0 px-6" placeholder="Search" loading={isLoading} onSearch={handleSearchBlog} />
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
                  name="Blog"
                  total={totalBlogs}
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
  );
};

export { BlogManager };
