import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { NewRoleDto, Role, UpdateRoleDto } from 'shared';
import { NewRoleZodSchema, Status, UpdateRoleZodSchema } from 'shared';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
} from 'ui';

import { roleService } from '@/services';

import type { RoleManagerState } from '.';

type RoleDialogState = {
  isDialogOpen: boolean;
  isDialogPending: boolean;
};

type RoleDialogProps = {
  role?: Role;
  setRoleManagerState: React.Dispatch<React.SetStateAction<RoleManagerState>>;
};

export type RoleDialogRef = {
  triggerOpenDialog: () => void;
};

const RoleDialog = forwardRef<RoleDialogRef, RoleDialogProps>(({ role, setRoleManagerState }, ref): JSX.Element => {
  const [roleDialogState, setRoleDialogState] = useState<RoleDialogState>({
    isDialogOpen: false,
    isDialogPending: false,
  });

  const roleForm = useForm<NewRoleDto | UpdateRoleDto>({
    resolver: zodResolver(role ? UpdateRoleZodSchema : NewRoleZodSchema),
    defaultValues: {
      status: Status.Inactive,
    },
    mode: 'all',
  });

  useEffect(() => {
    if (role) {
      roleForm.reset(role);
    } else {
      roleForm.reset({
        name: '',
        description: undefined,
        permissions: undefined,
        status: undefined,
      });
    }
  }, [role]);

  const handleOpenDialog = () => {
    setRoleDialogState((pre) => ({ ...pre, isDialogOpen: true }));
  };

  const handleCloseDialog = () => {
    roleForm.reset();
    setRoleDialogState((pre) => ({ ...pre, isDialogOpen: false }));
    setRoleManagerState((pre) => ({ ...pre, role: undefined }));
  };

  const onSubmit = async (data: NewRoleDto | UpdateRoleDto) => {
    if (role) {
      const updateRoleResponse = await roleService.updateRole(role._id, data);
      if (!updateRoleResponse.success || !updateRoleResponse.data) {
        toast.error(updateRoleResponse.message);

        return;
      }
      toast.success('Role updated successfully');
    } else {
      const createdRole = await roleService.createRole(data as NewRoleDto);

      if (!createdRole.success || !createdRole.data) {
        toast.error(createdRole.message);

        return;
      }

      toast.success('Role created successfully');
    }

    handleCloseDialog();

    const rolesResponse = await roleService.getRoles();
    if (!rolesResponse?.success || !rolesResponse?.data) {
      toast.error(rolesResponse.message);

      return;
    }

    setRoleManagerState((pre) => ({
      ...pre,
      roles: rolesResponse.data || [],
    }));
  };

  useImperativeHandle(ref, () => ({
    triggerOpenDialog() {
      handleOpenDialog();
    },
  }));

  return (
    <Dialog open={roleDialogState.isDialogOpen}>
      <DialogTrigger className="flex-none rounded-[3px]" onClick={handleOpenDialog}>
        <div className="flex flex-row items-center justify-center rounded-[3px] bg-primary p-2 font-semibold text-white opacity-90 hover:opacity-100">
          <Plus className="h-5 w-5 pr-1" />
          Create Role
        </div>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit' : 'Create'} Role</DialogTitle>
          <DialogDescription>{role ? 'Edit' : 'Create'} to Role here. Click save when you're done..</DialogDescription>
        </DialogHeader>
        <Form {...roleForm}>
          <div className="grid gap-4 py-4">
            <FormField
              control={roleForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} className="col-span-3" disabled={role !== undefined} />
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
              control={roleForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} className="col-span-3" />
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
              control={roleForm.control}
              name="status"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Status</FormLabel>
                    <FormControl>
                      <Switch
                        defaultChecked={false}
                        onCheckedChange={(value) => {
                          if (value) {
                            roleForm.setValue('status', Status.Active);
                          } else {
                            roleForm.setValue('status', Status.Inactive);
                          }
                        }}
                        className="col-span-3"
                      />
                    </FormControl>
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
            <button
              type="submit"
              className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
              onClick={roleForm.handleSubmit(onSubmit)}
            >
              Save
            </button>
          </DialogFooter>
        </Form>
        <DialogClose onClick={handleCloseDialog} />
      </DialogContent>
    </Dialog>
  );
});

export { RoleDialog };
