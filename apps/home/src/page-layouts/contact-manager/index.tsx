import type { ColumnDef, CoreRow, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Pagination, Search, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';

import { DEFAULT_PAGINATION } from '@/constants';
import type { Contact } from '@/interfaces';
import { contactService } from '@/services';

const ContactManager = () => {
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [totalContact, setTotalContact] = useState<number>(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  const handleSearchProduct = async (value: string) => {
    setSearchValue(value);
  };

  const contactColumns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'fullName',
      header: 'FullName',
      cell: ({ row }: { row: CoreRow<Contact> }) => <div contact-manager-name="true">{row.original.fullName}</div>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: { row: CoreRow<Contact> }) => <div>{row.original.phone}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: CoreRow<Contact> }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: 'webUrl',
      header: 'WebUrl',
      cell: ({ row }: { row: CoreRow<Contact> }) => <div>{row.original.webUrl}</div>,
    },
  ];

  const table = useReactTable({
    data: contacts,
    columns: contactColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }
    if (searchValue) {
      handleSearchProduct(searchValue);
    } else {
      (async () => {
        setIsLoading(true);
        const contactsResponse = await contactService.getContacts(pagination);
        setIsLoading(false);
        setIsLoadingTable(false);

        if (
          !contactsResponse.success ||
          !contactsResponse.data ||
          (!contactsResponse.total && contactsResponse.total !== 0)
        ) {
          toast.error(contactsResponse.message);

          return;
        }

        setContacts(contactsResponse.data);
        setTotalContact(contactsResponse.total);
        if (!contactsResponse.data.length || !contactsResponse.success) {
          setPagination((prev) => ({
            ...prev,
            pageIndex: DEFAULT_PAGINATION.pageIndex,
            pageSize: DEFAULT_PAGINATION.pageSize,
          }));
        }
      })();
    }
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Contact Manager</h2>

        <Button className="flex-none rounded-[3px]" disabled>
          <Plus className="h-5 w-5 pr-1" />
          Create Contact
        </Button>
      </div>
      <div className="mt-6 h-auto w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="pt-6">
            <Search className="mt-0 px-6" placeholder="Search" loading={isLoading} onSearch={handleSearchProduct} />
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
                          <TableCell colSpan={contactColumns.length} className="h-24 text-center">
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
                            <TableCell colSpan={contactColumns.length} className="h-24 text-center">
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    )}
                  </Table>
                </div>
                <Pagination
                  name="contacts"
                  total={totalContact}
                  pagination={pagination}
                  showInputPagination={{ showInput: true, showTotalOfPage: true }}
                  setPagination={setPagination}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  setIsParamLoaded={setIsParamLoaded}
                  count={contacts.length}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ContactManager };
