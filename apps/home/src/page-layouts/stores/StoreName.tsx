import type { SetStateAction } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Label, StoreSetupIcon } from 'ui';

import type { CustomStoreDto, Store } from '@/interfaces';
import { storeService } from '@/services/store';

import type { StoreState } from '.';

type StoreProps = {
  store: CustomStoreDto;
  setStoreState: React.Dispatch<SetStateAction<StoreState>>;
  currentStores: Store[];
};

const StoreName: React.FC<StoreProps> = (props) => {
  const { store, setStoreState, currentStores } = props;
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);

  const handleUpdateStore = async () => {
    const updatedStoreData = { name, description }; // Updated name and description
    const updatedStore = await storeService.updateStore(updatedStoreData, store._id);
    if (!updatedStore.success || !updatedStore.data) {
      toast.error(updatedStore.message);

      return;
    }

    // Create a new array with updated name and description
    const updatedStores = currentStores.map((existingStore) => {
      if (existingStore._id === store._id) {
        return { ...existingStore, name, description };
      }

      return existingStore;
    });
    toast.success('Update store successfully');

    setStoreState((pre) => ({
      ...pre,
      stores: updatedStores,
      openSetting: false,
    }));
  };

  const handleBackStore = () => {
    setStoreState((pre) => ({
      ...pre,
      openSetting: false,
    }));
  };

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-4">
      <div className="col-span-1 hidden p-4 lg:block">
        <StoreSetupIcon />
      </div>

      <div className="col-span-2 m-2">
        <form>
          {/* Card and Balance */}
          <div className="py-2">
            <h6 className="py-2 text-xl font-bold">Store name</h6>
            <p className="my-6 py-1 text-base text-[#686F71]">
              {' '}
              Your store name will be shown on the <b>ship from</b> field on shipping labels
            </p>
            <Label className="text-[#686F71]">Type in your store name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Store name"
              className="mt-2 rounded px-2 py-6"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <Input
              id="description"
              type="text"
              placeholder="Descriptions"
              className="mt-2 rounded px-2 py-6"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={handleBackStore}
              className="rounded bg-secondary text-black hover:bg-secondary hover:text-primary"
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateStore} className="rounded">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { StoreName };
