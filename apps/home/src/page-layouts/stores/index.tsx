import { faEllipsis, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Status } from 'shared';
import {
  ApiLogoStoreIcon,
  DeleteConfirmDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'ui';

import type { Store } from '@/interfaces';
import { storeService } from '@/services/store';
import { useSingleStore } from '@/store';

import { StoreName } from './StoreName';

export type StoreState = {
  stores?: Store[];
  openSetting: boolean;
  storeName: string;
  storeDescription: string;
};

const Stores: React.FC = () => {
  const { singleStore, updateSingleStore } = useSingleStore();
  const [storeState, setStoreState] = useState<StoreState>({
    openSetting: false,
    storeName: '',
    storeDescription: '',
  });

  useEffect(() => {
    const getStores = async () => {
      const storesResponse = await storeService.getStores();
      if (!storesResponse?.success || !storesResponse.data || !storesResponse.total) {
        toast.error(storesResponse?.message);

        return;
      }
      setStoreState((prev) => ({
        ...prev,
        stores: storesResponse.data!,
      }));
    };

    getStores();
  }, []);

  const storeSettingTabs = [
    {
      value: 'store-name',
      label: 'Store name',
      component: (
        <StoreName store={singleStore} setStoreState={setStoreState} currentStores={storeState.stores || []} />
      ),
    },
  ];

  const defaultTab = 'store-name';

  const handleCurrentStore = (storeData: Store) => {
    updateSingleStore(storeData);
  };

  const handleDeleteStore = async (storeId: string) => {
    const deleteStoreResponse = await storeService.deleteStore(storeId);
    if (!deleteStoreResponse.success || !deleteStoreResponse.data) {
      toast.error(deleteStoreResponse.message);

      return;
    }

    toast.success('Delete store successfully');
    setStoreState((pre) => ({
      ...pre,
      stores: (pre.stores || []).filter((s) => s._id !== storeId),
    }));
  };

  const handleCreateStore = async () => {
    const newStore = await storeService.createNewStore({
      name: storeState.storeName,
      description: storeState.storeDescription,
      status: Status.Active,
    });

    if (!newStore.success || !newStore.data) {
      toast.error(newStore.message);

      return;
    }

    setStoreState((pre) => ({
      ...pre,
      stores: [newStore.data, ...(pre.stores || [])],
    }));
  };

  const handleSwitch = async (storeId: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? Status.Inactive : Status.Active;

    setStoreState((pre) => ({
      ...pre,
      stores: (pre.stores || []).map((store) => {
        if (store._id === storeId) {
          return { ...store, status: newStatus };
        }

        return store;
      }),
    }));

    const updatedStore = await storeService.updateStore({ status: newStatus }, storeId);
    if (!updatedStore.success || !updatedStore.data) {
      toast.error(updatedStore.message);

      return;
    }
    toast.success('Update store successfully');
  };

  const handleOpenEditStore = (store: Store) => {
    handleCurrentStore(store);
    setStoreState((pre) => ({
      ...pre,
      openSetting: true,
    }));
  };

  return (
    <>
      {storeState.openSetting ? (
        <div className="w-full p-4">
          <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
            <h2 className="m-0 mb-2 flex-1 text-3xl font-bold leading-10 tracking-tighter md:mb-0 md:mr-8">
              My Stores
            </h2>
          </div>
          <div className="h-auto w-full border-2 bg-background p-4">
            <Tabs defaultValue={defaultTab} className="relative overflow-x-auto">
              <TabsList className="no-scrollbar mb-0 w-full overflow-y-hidden overflow-x-scroll bg-background pb-3">
                {storeSettingTabs.map((tabs) => (
                  <TabsTrigger className="w-fit" value={tabs.value} key={tabs.value}>
                    {tabs.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {storeSettingTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="w-full p-4">
          <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
            <h2 className="m-0 mb-2 flex-1 text-3xl font-bold leading-10 tracking-tighter md:mb-0 md:mr-8">
              My Stores
            </h2>
            <Dialog>
              <DialogTrigger
                // disabled={!storeState.stores}
                className={`flex flex-row items-center justify-center rounded-[3px] bg-primary p-2 font-semibold text-white ${
                  !storeState.stores ? 'opacity-20' : ''
                }`}
              >
                <Plus className="h-5 w-5 pr-1" />
                New Store
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new store</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                      id="name"
                      placeholder="Name"
                      value={storeState.storeName}
                      className="col-span-3"
                      onChange={(e) =>
                        setStoreState((pre) => ({
                          ...pre,
                          storeName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Description</Label>
                    <Input
                      id="description"
                      placeholder="Description"
                      value={storeState.storeDescription}
                      className="col-span-3"
                      onChange={(e) =>
                        setStoreState((pre) => ({
                          ...pre,
                          storeDescription: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogTrigger
                    type="submit"
                    className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                    onClick={() => handleCreateStore()}
                  >
                    Create
                  </DialogTrigger>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 h-auto w-full border bg-background px-4 shadow-lg sm:p-0" store-list="true">
            {(storeState.stores || []).map((store) => {
              const isActive = store.status === Status.Active;

              return (
                <div
                  key={store._id}
                  className="my-4 grid grid-cols-[min-content,1fr,min-content] gap-4 border p-4 shadow-xl sm:my-0 sm:grid-cols-5 sm:shadow-none"
                >
                  <div className="flex items-center justify-start align-middle sm:col-span-1">
                    <div className="flex flex-row justify-center space-x-2 align-middle md:space-x-4">
                      <div
                        className={`relative m-2 h-4 w-4 items-center rounded-lg bg-primary shadow ${
                          isActive ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`w-fit justify-center rounded-full border p-1 align-middle ${
                          isActive ? 'border-primary' : 'border-transparent'
                        } `}
                      >
                        <ApiLogoStoreIcon />
                      </div>
                    </div>
                  </div>
                  <div className="sm:order-5">{''}</div>
                  <div className="flex items-center justify-end space-x-4 sm:order-last">
                    <FontAwesomeIcon
                      className="h-4 w-4 hover:cursor-pointer"
                      icon={faGear}
                      onClick={() => handleOpenEditStore(store)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <FontAwesomeIcon className="h-4 w-4 hover:cursor-pointer" icon={faEllipsis} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleOpenEditStore(store)}
                        >
                          Edit
                        </DropdownMenuLabel>
                        <DropdownMenuLabel>
                          <Switch checked={isActive} onCheckedChange={() => handleSwitch(store._id, isActive)} />
                        </DropdownMenuLabel>
                        <DropdownMenuLabel className="cursor-pointer text-red-600 hover:bg-secondary">
                          <DeleteConfirmDialog
                            onConfirm={() => handleDeleteStore(store._id)}
                            target="store"
                          ></DeleteConfirmDialog>
                        </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div
                    className="col-span-3 flex items-center justify-start text-xl font-bold sm:col-span-1"
                    store-item="true"
                  >
                    {`${store.name} (${store.code})`}
                  </div>
                  <div className="flex flex-row">
                    <div className="col-span-1 flex items-baseline sm:flex sm:flex-col-reverse md:justify-end lg:flex-row-reverse">
                      {'0'} <span className="m-1 font-light md:mr-2">Orders</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export { Stores };
