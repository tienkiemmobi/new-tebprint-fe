import { PencilIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from 'ui';

import type { OptionsMap } from './EditProductTable';
import type { EditProductState } from './index';

export function EditVariantsDialog({
  optionsMap,
  setOptionsMap,
  propertyOrder,
  setPropertyOrder,
  isUpdateVariantsDialogOpen,
  setIsUpdateVariantsDialogOpen,
  handleUpdateVariants,
  setEditProductState,
}: {
  optionsMap: OptionsMap;
  setOptionsMap: React.Dispatch<React.SetStateAction<OptionsMap>>;
  propertyOrder: Array<keyof OptionsMap>;
  setPropertyOrder: React.Dispatch<React.SetStateAction<Array<keyof OptionsMap>>>;
  isUpdateVariantsDialogOpen: boolean;
  setIsUpdateVariantsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateVariants: (event?: React.MouseEvent<HTMLButtonElement, React.MouseEvent>) => void;
  setEditProductState: React.Dispatch<React.SetStateAction<EditProductState>>;
}) {
  const [editingItem, setEditingItem] = useState<{ key: keyof OptionsMap; oldValue: string; newValue: string } | null>(
    null,
  );
  const removeOption = (key: keyof OptionsMap, item: string) => {
    setOptionsMap({
      ...optionsMap,
      [key]: optionsMap[key].filter((optionValue) => optionValue !== item),
    });
  };

  const startEditing = (key: keyof OptionsMap, item: string) => {
    setEditingItem({ key, oldValue: item, newValue: item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveRename = () => {
    if (!editingItem || editingItem.oldValue === editingItem.newValue.trim()) {
      setEditingItem(null);
      return;
    }

    const { key, oldValue, newValue } = editingItem;
    const trimmedNewValue = newValue.trim();

    if (!trimmedNewValue || trimmedNewValue === oldValue) {
      setEditingItem(null);
      return;
    }

    // Check if new value already exists
    if (optionsMap[key].includes(trimmedNewValue)) {
      setEditingItem(null);
      return;
    }

    // Update optionsMap
    setOptionsMap({
      ...optionsMap,
      [key]: optionsMap[key].map((optionValue) => (optionValue === oldValue ? trimmedNewValue : optionValue)),
    });

    // Update all variants that use the old value
    setEditProductState((prev: EditProductState) => {
      return {
        ...prev,
        variants: prev.variants
          .map((variant) => {
            if (variant[key] === oldValue) {
              const updatedVariant = {
                ...variant,
                [key]: trimmedNewValue,
                isEdited: true,
              };
              return updatedVariant;
            }
            return variant;
          })
          .sort((a: any, b: any) => {
            const sizeA = parseInt(a.size, 10);
            const sizeB = parseInt(b.size, 10);
            return sizeA - sizeB;
          }),
      };
    });

    setEditingItem(null);
  };

  const onDragPropertyEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const reorderedProperties = [...propertyOrder];
    const [removed] = reorderedProperties.splice(source.index, 1);
    if (removed) reorderedProperties.splice(destination.index, 0, removed);

    setPropertyOrder(reorderedProperties);
  };

  const onDragOptionEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const reorderedOptions = Array.from(optionsMap[source.droppableId as keyof OptionsMap]);
    const [removed] = reorderedOptions.splice(source.index, 1);
    if (removed) reorderedOptions.splice(destination.index, 0, removed);

    setOptionsMap({
      ...optionsMap,
      [source.droppableId]: reorderedOptions,
    });
  };

  return (
    <>
      <Dialog open={isUpdateVariantsDialogOpen}>
        <DialogContent className="min-w-[50%] " onOpenAutoFocus={(e) => e.preventDefault()} showClose={false}>
          <DialogHeader>
            <DialogTitle>Edit Variants</DialogTitle>
          </DialogHeader>

          <div className="h-[50vh] overflow-y-auto">
            <DragDropContext onDragEnd={onDragPropertyEnd}>
              <Droppable droppableId="properties" direction="vertical">
                {(propertyDropProvided: any) => (
                  <ul {...propertyDropProvided.droppableProps} ref={propertyDropProvided.innerRef}>
                    {propertyOrder.map((key, propertyIndex) => (
                      <Draggable key={key} draggableId={key} index={propertyIndex}>
                        {(propertyDragProvided: any) => (
                          <li
                            ref={propertyDragProvided.innerRef}
                            {...propertyDragProvided.draggableProps}
                            {...propertyDragProvided.dragHandleProps}
                            className="mb-6"
                          >
                            <div>
                              <h3 className="text-lg font-medium capitalize" {...propertyDragProvided.dragHandleProps}>
                                {key}
                              </h3>

                              <div className="mb-4 flex items-center space-x-2">
                                <Input
                                  id={`new-option-value-${key}`}
                                  className="flex-1"
                                  placeholder="Name the option"
                                />
                                <Button
                                  onClick={() => {
                                    const newOption = (
                                      document.getElementById(`new-option-value-${key}`) as HTMLInputElement
                                    )?.value.trim();

                                    if (!newOption) {
                                      return;
                                    }

                                    if (!optionsMap[key as keyof OptionsMap].includes(newOption)) {
                                      setOptionsMap({
                                        ...optionsMap,
                                        [key]: [...optionsMap[key as keyof OptionsMap], newOption],
                                      });
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                              <DragDropContext onDragEnd={onDragOptionEnd}>
                                <Droppable droppableId={key} key={key}>
                                  {(optionDropProvided: any) => (
                                    <ul
                                      {...optionDropProvided.droppableProps}
                                      ref={optionDropProvided.innerRef}
                                      className="space-y-4"
                                    >
                                      {optionsMap[key as keyof OptionsMap].map((item, optionIndex) => {
                                        const isEditing = editingItem?.key === key && editingItem?.oldValue === item;
                                        return (
                                          <Draggable key={item} draggableId={item} index={optionIndex}>
                                            {(optionDragProvided: any) => (
                                              <li
                                                ref={optionDragProvided.innerRef}
                                                {...optionDragProvided.draggableProps}
                                                {...optionDragProvided.dragHandleProps}
                                                className="flex items-center justify-between rounded bg-gray-100 p-2"
                                              >
                                                {isEditing ? (
                                                  <>
                                                    <Input
                                                      value={editingItem.newValue}
                                                      onChange={(e) =>
                                                        setEditingItem({
                                                          ...editingItem,
                                                          newValue: e.target.value,
                                                        })
                                                      }
                                                      onBlur={saveRename}
                                                      onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                          saveRename();
                                                        } else if (e.key === 'Escape') {
                                                          cancelEditing();
                                                        }
                                                      }}
                                                      autoFocus
                                                      className="mr-2 flex-1"
                                                      onClick={(e) => e.stopPropagation()}
                                                    />
                                                  </>
                                                ) : (
                                                  <span>{item}</span>
                                                )}
                                                <div className="flex items-center gap-2">
                                                  {!isEditing && (
                                                    <button
                                                      className="text-gray-400 hover:text-gray-600"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(key as keyof OptionsMap, item);
                                                      }}
                                                    >
                                                      <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                  )}
                                                  <button
                                                    className="text-gray-400 hover:text-gray-600"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (isEditing) {
                                                        cancelEditing();
                                                      } else {
                                                        removeOption(key as keyof OptionsMap, item);
                                                      }
                                                    }}
                                                  >
                                                    <XIcon />
                                                  </button>
                                                </div>
                                              </li>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                      {optionDropProvided.placeholder}
                                    </ul>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {propertyDropProvided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <DialogFooter>
            <Button onClick={() => handleUpdateVariants()}>Update</Button>
          </DialogFooter>
          <DialogClose
            onClick={() => {
              setIsUpdateVariantsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
