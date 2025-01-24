import { XIcon } from 'lucide-react';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from 'ui';

import type { OptionsMap } from './EditProductTable';

export function EditVariantsDialog({
  optionsMap,
  setOptionsMap,
  propertyOrder,
  setPropertyOrder,
  isUpdateVariantsDialogOpen,
  setIsUpdateVariantsDialogOpen,
  handleUpdateVariants,
}: {
  optionsMap: OptionsMap;
  setOptionsMap: React.Dispatch<React.SetStateAction<OptionsMap>>;
  propertyOrder: Array<keyof OptionsMap>;
  setPropertyOrder: React.Dispatch<React.SetStateAction<Array<keyof OptionsMap>>>;
  isUpdateVariantsDialogOpen: boolean;
  setIsUpdateVariantsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateVariants: (event?: React.MouseEvent<HTMLButtonElement, React.MouseEvent>) => void;
}) {
  const removeOption = (key: keyof OptionsMap, item: string) => {
    setOptionsMap({
      ...optionsMap,
      [key]: optionsMap[key].filter((optionValue) => optionValue !== item),
    });
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
                                      {optionsMap[key as keyof OptionsMap].map((item, optionIndex) => (
                                        <Draggable key={item} draggableId={item} index={optionIndex}>
                                          {(optionDragProvided: any) => (
                                            <li
                                              ref={optionDragProvided.innerRef}
                                              {...optionDragProvided.draggableProps}
                                              {...optionDragProvided.dragHandleProps}
                                              className="flex items-center justify-between rounded bg-gray-100 p-2"
                                            >
                                              <span>{item}</span>
                                              <button
                                                className="text-gray-400 hover:text-gray-600"
                                                onClick={() => removeOption(key as keyof OptionsMap, item)}
                                              >
                                                <XIcon />
                                              </button>
                                            </li>
                                          )}
                                        </Draggable>
                                      ))}
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
