/* eslint-disable @typescript-eslint/naming-convention */
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Dot, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { type Role, Status } from 'shared';
import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Search,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';

import { roleService } from '@/services';

import type { RoleDialogRef } from './RoleDialog';
import { RoleDialog } from './RoleDialog';

export type RoleManagerState = {
  roles: Role[];
  role?: Role;
  isTableLoading: boolean;
};

const RoleManager = () => {
  const [roleMangerState, setRoleManagerState] = useState<RoleManagerState>({
    roles: [],
    isTableLoading: true,
  });

  const roleDialogRef = useRef<RoleDialogRef>(null);

  const roleColumns: ColumnDef<Role>[] = [
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { name } = row.original;

        return <p role-manager-name="true">{name}</p>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const { description } = row.original;

        return <p>{description}</p>;
      },
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const { permissions } = row.original;

        return <p>{permissions}</p>;
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
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="block"
                  onSelect={(e) => {
                    e.preventDefault();
                    setRoleManagerState((pre) => ({ ...pre, role: row.original }));
                    roleDialogRef.current?.triggerOpenDialog();
                  }}
                >
                  <div className="block w-full cursor-pointer text-left">Edit</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: roleMangerState.roles,
    columns: roleColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    (async () => {
      const rolesResponse = await roleService.getRoles();
      if (!rolesResponse.success || !rolesResponse.data) {
        toast.error(rolesResponse.message);

        return;
      }

      setRoleManagerState((pre) => ({
        ...pre,
        isTableLoading: false,
        roles: rolesResponse.data!,
      }));
    })();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Role Manager</h2>
        <RoleDialog role={roleMangerState.role} setRoleManagerState={setRoleManagerState} ref={roleDialogRef} />
      </div>
      <div className="mt-6 rounded-sm border bg-white shadow-md">
        <div className="pt-6">
          <Search className="mt-0 px-6" placeholder="Search" />
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
                  {roleMangerState.isTableLoading ? (
                    <TableBody className="px-6">
                      <TableRow>
                        <TableCell colSpan={roleColumns.length} className="h-24 text-center">
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
                          <TableCell colSpan={roleColumns.length} className="h-24 text-center">
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  )}
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export { RoleManager };
