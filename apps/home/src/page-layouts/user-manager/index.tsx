/* eslint-disable @typescript-eslint/naming-convention */
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Dot, Loader2, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { Role, UpdateUserDto, User } from 'shared';
import { Status } from 'shared';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Pagination,
  Search,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui';
import { z } from 'zod';

import { DEFAULT_PAGINATION, RoleType } from '@/constants';
import { addUser, getUsers, resetPassword, roleService, userService } from '@/services';
import type { ChangeBalanceTransactionDto } from '@/services/transaction';
import { transactionService } from '@/services/transaction';
import { useAuthStore } from '@/store';

const CreateUserInfo = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }).max(40),
  email: z.string().email().min(1, { message: 'Email is required' }).max(30),
  // .refine((value) => value.endsWith('@tebprint.com'), {
  //   message: 'Email must have the domain @tebprint.com',
  // }),
  phone: z
    .string()
    .regex(/^\d+$/, { message: 'Invalid phone number' })
    .min(1, { message: 'Phone is required' })
    .max(15, { message: 'Invalid phone number' }),
  address: z.string().trim(),
  gender: z.string().trim().min(1, { message: 'Gender is required, Please select an gender to display' }),
  roleId: z.string().trim().min(1, { message: 'Role is required' }),
  password: z.string().trim().min(8, { message: 'Password must be at least 8 characters' }).max(32),
  // factories: z.string().trim().min(1, { message: 'Factory is required' }),
});

type CreateUserInfoType = z.infer<typeof CreateUserInfo>;

const UserManager = () => {
  const { user } = useAuthStore.getState();
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [searchValue, setSearchValue] = useState('');
  const [isParamLoaded, setIsParamLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isCurrentRef = useRef<boolean>(false);
  const roleValueRef = useRef<Record<string, string | boolean>>({});
  const defaultValues = {
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    roleId: '',
  };
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const [supportUsers, setSupportUsers] = useState<User[]>([]);
  const [selectedSupportUser, setSelectedSupportUser] = useState<User | null>(null);

  const form = useForm<CreateUserInfoType>({
    resolver: zodResolver(CreateUserInfo),
    defaultValues,
    mode: 'all',
  });

  const handleResetPassword = async (emailValue: string) => {
    const resp = await resetPassword(emailValue);
    if (!resp?.success || !resp?.data) {
      toast.error(resp?.message);

      return;
    }

    toast.success(`Reset password successfully - ${resp.data}`);
  };

  const handleSearchUser = async (value: string) => {
    setSearchValue(value);
  };

  const handleInputDialog = (valueInput: string | boolean, key: keyof UpdateUserDto) => {
    roleValueRef.current = { ...roleValueRef.current, [key]: valueInput };
  };

  const balanceValueRefs = {
    total: useRef<HTMLInputElement>(null),
    method: 'Balance',
    type: '',
    currency: 'USD',
  };

  const handleBalanceEdit = async (email: string) => {
    const changeBalanceData: ChangeBalanceTransactionDto = {
      email,
      total: Number(balanceValueRefs.total.current?.value),
      method: balanceValueRefs.method ?? '',
      type: balanceValueRefs.type ?? '',
      currency: balanceValueRefs.currency ?? '',
    };
    const changeBalanceResponse = await transactionService.changeBalance(changeBalanceData);
    if (!changeBalanceResponse.success || !changeBalanceResponse.data) {
      toast.error(changeBalanceResponse.message);
    }
    toast.success('Change balance successfully');
  };

  const handleChooseSupport = async (userId) => {
    try {
      const response = await userService.update(userId, {
        supportUserId: selectedSupportUser?._id,
      });

      if (!response.success) {
        toast.error(response.message);

        return;
      }

      toast.success('Support user assigned successfully');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to assign support user');
    }
  };

  const handleUpdateUser = async (idUser: string) => {
    setIsLoading(true);
    const param = { status: isCurrentRef.current ? Status.Active : Status.Inactive, ...roleValueRef.current };
    const editUserResponse = await userService.update(idUser, param);
    setIsLoading(false);

    if (!editUserResponse.success || !editUserResponse.data) {
      toast.error(editUserResponse.message);

      return;
    }

    toast.success(`Update user successfully`);
  };

  const fetchUsers = async () => {
    const usersResponse = await getUsers(pagination, searchValue);
    setIsLoadingTable(false);

    if (!usersResponse.success || !usersResponse.data || !usersResponse.total) {
      toast.error(usersResponse.message);

      return;
    }

    setUsers(usersResponse.data);
    setTotalUsers(usersResponse.total);
    if (!usersResponse.data.length || !usersResponse.success) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: DEFAULT_PAGINATION.pageIndex,
        pageSize: DEFAULT_PAGINATION.pageSize,
      }));
    }
  };

  const fetchSupportUsers = async () => {
    const usersResponse = await getUsers(pagination, searchValue, 'Support');
    setIsLoadingTable(false);

    if (!usersResponse.success || !usersResponse.data || !usersResponse.total) {
      toast.error(usersResponse.message);

      return;
    }

    setSupportUsers(usersResponse.data);
  };

  const onSubmit = async (data: CreateUserInfoType) => {
    const userResponse = await addUser(data);

    if (!userResponse.success) {
      toast.error(userResponse.message);
    }

    if (userResponse?.success) {
      setIsDialogOpen(false);
      form.reset();
      toast.success('User created successfully');

      await fetchUsers();
    }
  };

  const columns: ColumnDef<User>[] = [
    // {
    //   accessorKey: 'select',
    //   header: ({ table }) => (
    //     <div className="flex items-center gap-6">
    //       <Checkbox
    //         checked={table.getIsAllPageRowsSelected()}
    //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //         aria-label="Select all"
    //       />
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: 'avatar',
      header: 'Avatar',
      cell: () => (
        <div className="relative my-4 h-24 min-h-[96px] w-24 cursor-pointer overflow-hidden rounded-[3px] border border-solid border-[#e3e4e5]">
          <img
            className="absolute left-2/4 top-2/4 h-full w-auto translate-x-[-50%] translate-y-[-50%]"
            width="168"
            height="168"
            src="https://i.imgur.com/zmr1k8X.png"
          ></img>
        </div>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'FullName & Email',
      cell: ({ row }) => {
        const { fullName, email } = row.original;

        return (
          <div className="block">
            <div user-manager-name="true">{fullName}</div>
            <br />
            <div>{email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const { balance } = row.original;

        return <p>{balance || 0}</p>;
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const { role } = row.original;

        return (
          <div>
            <p>{role?.name}</p>
            {role?.name === RoleType.REFERER && <p className="text-warning">{row.original.refCode}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: 'supportUserId',
      header: 'Support User',
      cell: ({ row }) => {
        const { supportUserId } = row.original;

        return <p>{supportUserId ? supportUserId.fullName : ''}</p>;
      },
    },
    {
      accessorKey: 'telegramConfig',
      header: 'Telegram',
      cell: ({ row }) => {
        return (
          <>
            {row.original.telegramConfig?.isNotificationEnabled ? (
              <Dot color="#03fc1c" strokeWidth={10} fill="#03fc1c" />
            ) : (
              <Dot color="#e61919" strokeWidth={10} fill="#e61919" />
            )}

            <p>{row.original.telegramConfig?.telegramChannelId}</p>
          </>
        );
      },
    },
    // {
    //   accessorKey: 'description',
    //   header: 'Description',
    //   cell: () => (
    //     <>
    //       <p>0 Stores</p>
    //       <p>0 Orders</p>
    //     </>
    //   ),
    // },
    // {
    //   accessorKey: 'userCode',
    //   header: 'UserCode',
    //   cell: ({ row }) => {
    //     const { userCode } = row.original;

    //     return <p>{userCode}</p>;
    //   },
    // },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status } = row.original;

        return (
          <p className="flex items-center">
            {' '}
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
        const { _id, email, status, role: roleId, telegramConfig } = row.original;
        const [isCurrentActive, setIsCurrentActive] = useState<boolean>(status === Status.Active);

        return (
          <div className="flex items-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Edit */}
                <DropdownMenuItem className="block" onSelect={(e) => e.preventDefault()}>
                  <Dialog>
                    <DialogTrigger
                      onClick={() => {
                        handleInputDialog(roleId._id, 'roleId');
                        isCurrentRef.current = status === Status.Active;
                        setIsCurrentActive(status === Status.Active);
                      }}
                      className="w-full"
                    >
                      <div className="block w-full text-left">Edit</div>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="col-span-2 flex items-center gap-4">
                            <Label className="text-right">Role</Label>
                            <Select
                              defaultValue={roleId && roleId._id ? roleId._id : ''}
                              onValueChange={(value) => handleInputDialog(value, 'roleId')}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue
                                  placeholder={
                                    roleId ? roles.find((role) => role._id === roleId._id)?.name : 'Select Role'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => {
                                  return (
                                    <SelectItem key={role._id} value={role._id}>
                                      {role.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-4">
                            <Label htmlFor="Status" className="text-right">
                              Status
                            </Label>
                            <Switch
                              checked={isCurrentActive}
                              onCheckedChange={(value) => {
                                setIsCurrentActive(!isCurrentActive);
                                isCurrentRef.current = value;
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label htmlFor="Status" className="text-right">
                          Notification Enabled
                        </Label>
                        <Switch
                          checked={telegramConfig?.isNotificationEnabled}
                          onCheckedChange={(value) => {
                            handleInputDialog(value, 'isNotificationEnabled');
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="telegramChannelId">Telegram Chat Id</Label>
                        <Input
                          id="telegramChannelId"
                          type="telegramChannelId"
                          defaultValue={telegramConfig?.telegramChannelId}
                          onChange={(e) => {
                            console.log(37243294, e.target.value, telegramConfig);
                            handleInputDialog(e.target.value, 'telegramChannelId');

                            if (telegramConfig && telegramConfig.telegramChannelId)
                              telegramConfig.telegramChannelId = e.target.value;
                          }}
                        />
                      </div>
                      <DialogFooter>
                        <DialogTrigger className="flex items-center justify-end gap-2">
                          <div
                            onClick={() => handleUpdateUser(_id)}
                            className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                          >
                            Save changes
                          </div>
                          <div
                            onClick={() => handleResetPassword(email)}
                            className="rounded-[3px] bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                          >
                            Reset password
                          </div>
                        </DialogTrigger>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

                {/* Change Balance */}
                {([RoleType.ADMIN] as string[]).includes(user?.role || '') && (
                  <DropdownMenuItem className="block" onSelect={(e) => e.preventDefault()}>
                    <Dialog>
                      <DialogTrigger className="w-full">
                        <div className="block w-full text-left">Change Balance</div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Balance</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-4 flex items-center gap-4">
                              <Label className="text-right">Email</Label>
                              <Input value={email} disabled className="font-bold" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 py-2">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-2 flex items-center gap-4">
                              <Label className="text-right">Type</Label>
                              <Select
                                onValueChange={(value) => {
                                  balanceValueRefs.type = value;
                                }}
                                required
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder={'Select Type '} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem key={'TopUp'} value={'TopUp'}>
                                    Top up
                                  </SelectItem>
                                  <SelectItem key={'Charge'} value={'Charge'}>
                                    Charge
                                  </SelectItem>
                                  <SelectItem key={'Refund'} value={'Refund'}>
                                    Refund
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 flex items-center gap-4">
                              <Label className="text-right">Value</Label>
                              <Input type="number" min={0.01} step={0.01} ref={balanceValueRefs.total} required />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogTrigger>
                            <div
                              className="rounded-[3px] bg-primary p-2 px-3 opacity-90 hover:opacity-100"
                              onClick={() => handleBalanceEdit(email)}
                            >
                              Change Balance
                            </div>
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                )}

                {/* Change Balance */}
                {([RoleType.ADMIN] as string[]).includes(user?.role || '') && (
                  <DropdownMenuItem className="block" onSelect={(e) => e.preventDefault()}>
                    <Dialog>
                      <DialogTrigger className="w-full">
                        <div className="block w-full text-left">Choose Support</div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Choose Support</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-4 flex items-center gap-4">
                              <Label className="text-right">Support User</Label>
                              <Select
                                onValueChange={(value) => {
                                  const selectedUser = supportUsers.find((u) => u._id === value);
                                  setSelectedSupportUser(selectedUser);
                                }}
                                required
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select support user" />
                                </SelectTrigger>
                                <SelectContent>
                                  {supportUsers.map((u) => (
                                    <SelectItem key={u._id} value={u._id}>
                                      {u.fullName} ({u.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button
                            type="button"
                            className="rounded-[3px] bg-primary p-2 px-3 opacity-90 hover:opacity-100"
                            onClick={() => handleChooseSupport(_id)}
                          >
                            Submit
                          </Button>
                        </div>
                        <DialogFooter>
                          <DialogClose>
                            <div className="rounded-[3px] bg-primary p-2 px-3 opacity-90 hover:opacity-100">Close</div>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (!isParamLoaded) {
      return;
    }

    fetchUsers();
    fetchSupportUsers();
  }, [pagination.pageIndex, pagination.pageSize, searchValue, isParamLoaded]);

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesResponse = await roleService.getRoles();
      if (!rolesResponse.success || !rolesResponse.data) {
        toast.error(rolesResponse.message);

        return;
      }

      setRoles(rolesResponse.data);
    };

    fetchRoles();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
        <h2 className="m-0 mb-2 flex-1 text-3xl font-bold leading-10 tracking-tighter md:mb-0 md:mr-8">User Manager</h2>
        <Dialog open={isDialogOpen}>
          <DialogTrigger onClick={() => setIsDialogOpen(true)}>
            <div className="flex flex-row items-center justify-center rounded-[3px] bg-primary p-2 font-semibold text-white">
              <Plus className="h-5 w-5 pr-1" />
              Create User
            </div>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} className="col-span-3" />
                        </FormControl>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} className="col-span-3" />
                        </FormControl>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone" {...field} className="col-span-3" />
                        </FormControl>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Gender</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl className="col-span-3">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a verified gender to display" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Address" {...field} className="col-span-3" />
                        </FormControl>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Password" {...field} className="col-span-3" />
                        </FormControl>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Role</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl className="col-span-3">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => {
                              return (
                                <SelectItem key={role._id} value={role._id}>
                                  {role.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Create
                </Button>
              </DialogFooter>
            </Form>
            <DialogClose
              onClick={() => {
                form.reset();
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6 h-auto w-full">
        <div className="rounded-sm border bg-white shadow-md">
          <div className="pt-6">
            <Search
              className="mt-0 px-6"
              placeholder="Search"
              searchValue={searchValue}
              loading={isLoading}
              onSearch={handleSearchUser}
            />
            <div className=" p-6">
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
                          <TableCell colSpan={columns?.length || 0} className="h-24 text-center">
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
                            <TableCell colSpan={columns?.length || 0} className="h-24 text-center">
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    )}
                  </Table>
                </div>
                <Pagination
                  name="users"
                  total={totalUsers}
                  pagination={pagination}
                  showInputPagination={{ showInput: true, showTotalOfPage: true }}
                  setPagination={setPagination}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  count={users.length}
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

export { UserManager };
