import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { Category, CategoryParentDto } from 'shared';
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
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui';

import type { NewCategoryDto, UpdateCategoryDto } from '@/interfaces';
import { NewCategoryZodSchema, UpdateCategoryZodSchema } from '@/interfaces';
import { categoryService } from '@/services/category';

import type { CategoryMangerState } from '.';

type CategoryDialogState = {
  isDialogOpen: boolean;
  isDialogPending: boolean;
  categoryParents: CategoryParentDto[];
};
type CategoryDialogProps = {
  category?: Category;
  setCategoryManagerState: React.Dispatch<React.SetStateAction<CategoryMangerState>>;
  // fetchCategories: () => Promise<void>;
};

export type CategoriesDialogRef = {
  triggerOpenDialog: () => void;
};

const CategoriesDialog = forwardRef<CategoriesDialogRef, CategoryDialogProps>(
  ({ category, setCategoryManagerState }, ref): JSX.Element => {
    const categoryZodSchema = category ? UpdateCategoryZodSchema : NewCategoryZodSchema;

    const [categoryDialogState, setCategoryDialogState] = useState<CategoryDialogState>({
      isDialogOpen: false,
      isDialogPending: false,
      categoryParents: [],
    });

    const categoryForm = useForm<NewCategoryDto | UpdateCategoryDto>({
      resolver: zodResolver(categoryZodSchema),
      defaultValues: {
        name: '',
        code: '',
      },
      mode: 'all',
    });

    const fetchCategoryParents = async () => {
      const categoriesParentResponse = await categoryService.getAllCategories();
      if (!categoriesParentResponse.success || !categoriesParentResponse.data) {
        toast.error(categoriesParentResponse.message);

        return;
      }
      setCategoryDialogState((pre) => ({ ...pre, categoryParents: categoriesParentResponse.data || [] }));
    };

    useEffect(() => {
      if (category) {
        categoryForm.reset({
          ...category,
          parentId: category.parent?._id,
        });
      } else {
        categoryForm.reset({
          name: '',
          code: '',
          description: '',
        });
      }

      fetchCategoryParents();
    }, [category]);

    const handleOpenDialog = () => {
      setCategoryDialogState((pre) => ({ ...pre, isDialogOpen: true }));
    };

    const handleCloseDialog = () => {
      categoryForm.reset();
      setCategoryDialogState((pre) => ({ ...pre, isDialogOpen: false }));
      setCategoryManagerState((pre) => {
        const newCategoryState = { ...pre };
        delete newCategoryState.category;

        return newCategoryState;
      });
    };

    const handleEditorAddCategory = async (data: NewCategoryDto | UpdateCategoryDto) => {
      if (category) {
        const updateCategoryResponse = await categoryService.updateCategory(data, category._id);
        if (!updateCategoryResponse.success || !updateCategoryResponse.data) {
          toast.error(updateCategoryResponse.message);

          return;
        }
        toast.success('Category updated successfully');
      } else {
        const createdCategory = await categoryService.createCategory({ ...data });

        if (!createdCategory.success || !createdCategory.data) {
          toast.error(createdCategory.message);

          return;
        }

        toast.success('Category created successfully');
      }

      handleCloseDialog();

      const categoriesResponse = await categoryService.getCategories();
      if (!categoriesResponse?.success || !categoriesResponse?.data || !categoriesResponse.total) {
        toast.error(categoriesResponse.message);

        return;
      }
      setCategoryManagerState((pre) => ({
        ...pre,
        totalCategory: categoriesResponse.total || 0,
        categories: categoriesResponse.data || [],
      }));
    };

    useImperativeHandle(ref, () => ({
      triggerOpenDialog() {
        handleOpenDialog();
      },
    }));

    return (
      <Dialog open={categoryDialogState.isDialogOpen}>
        <DialogTrigger className="flex-none rounded-[3px]" onClick={handleOpenDialog}>
          <div className="flex flex-row items-center justify-center rounded-[3px] bg-primary p-2 font-semibold text-white opacity-90 hover:opacity-100">
            <Plus className="h-5 w-5 pr-1" />
            New Category
          </div>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>{category ? 'Edit' : 'Create'} Category</DialogTitle>
            <DialogDescription>
              {category ? 'Edit' : 'Create'} to Category here. Click save when you're done..
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <div className="grid gap-4 py-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Name
                        {!categoryZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </Label>
                      <FormControl>
                        <Input placeholder="Name" {...field} className="col-span-3" />
                      </FormControl>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormMessage className="col-span-3" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Code
                        {!categoryZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </Label>
                      <FormControl>
                        <Input placeholder="Code" {...field} className="col-span-3" />
                      </FormControl>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormMessage className="col-span-3" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Description
                        {!categoryZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </Label>
                      <FormControl>
                        <Input placeholder="Description" {...field} className="col-span-3" />
                      </FormControl>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormMessage className="col-span-3" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Parent Id
                        {!categoryZodSchema.shape[field.name].isOptional() && (
                          <span className="text-destructive"> *</span>
                        )}
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea type="always" className="max-h-[300px] overflow-y-auto">
                            {categoryDialogState.categoryParents.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <div>
                        <FormLabel className="text-right"></FormLabel>
                        <FormMessage className="col-span-3" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogTrigger
                type="submit"
                className="rounded-[5px] border bg-green-500 p-2 text-base text-white hover:bg-green-700 hover:text-white disabled:opacity-60"
                onClick={categoryForm.handleSubmit(handleEditorAddCategory)}
              >
                Save
              </DialogTrigger>
            </DialogFooter>
          </Form>
          <DialogClose onClick={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    );
  },
);

export { CategoriesDialog };
