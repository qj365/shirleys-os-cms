/* eslint-disable @typescript-eslint/no-explicit-any */
import { useProductDetailStore } from '@/lib/stores/productDetailStore';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  Card,
  Input,
  Modal,
  Space,
  Tag,
  message,
  notification,
} from 'antd';
import clsx from 'clsx';
import { GripVertical, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const DragHandle: React.FC<{ listeners: any; attributes: any }> = ({
  listeners,
  attributes,
}) => (
  <span
    {...listeners}
    {...attributes}
    style={{
      cursor: 'grab',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <GripVertical size={16} />
  </span>
);

const SortableItem: React.FC<{
  id: string;
  children: (props: any) => React.ReactNode;
}> = ({ id, children }) => {
  const { setNodeRef, transform, transition, attributes, listeners } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
};

const ProductDetailPropertyConfig: React.FC = () => {
  const {
    properties,
    addProperty,
    deleteProperty,
    restoreDeleted,
    updateProperty,
    reorderProperties,
    reorderValues,
    handleGetTemplateVariants,
  } = useProductDetailStore();

  const [isRefreshTemplates, setIsRefreshTemplates] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // --- Drag reorder property ---
  const handlePropertyDragEnd = (e: any) => {
    const { active, over } = e;
    if (active.id !== over?.id) {
      const oldIndex = properties.findIndex(p => p.id === active.id);
      const newIndex = properties.findIndex(p => p.id === over.id);
      reorderProperties(oldIndex, newIndex);
      setIsRefreshTemplates(true);
    }
  };

  // --- Drag reorder values (only in edit mode) ---
  const handleValueDragEnd = (propertyIndex: number, e: any) => {
    const { active, over } = e;
    if (active.id !== over?.id) {
      const oldIndex = properties[propertyIndex].values.indexOf(active.id);
      const newIndex = properties[propertyIndex].values.indexOf(over.id);

      reorderValues(propertyIndex, oldIndex, newIndex);
    }
  };

  const handleDelete = (index: number, name: string) => {
    Modal.confirm({
      title: 'Delete property?',
      content: 'Are you sure you want to delete this property?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        deleteProperty(index);
        notification.info({
          message: `You've deleted property ${name}`,
          description: (
            <Button
              type="link"
              size="small"
              onClick={() => {
                restoreDeleted();
                notification.destroy();
                message.success('Undo successful');
                setIsRefreshTemplates(true);
              }}
            >
              Undo
            </Button>
          ),
          duration: 5,
        });
        setIsRefreshTemplates(true);
      },
      okButtonProps: {
        danger: true,
      },
      cancelButtonProps: {
        className: '!border !border-error !text-error hover:opacity-75',
      },
    });
  };

  useEffect(() => {
    if (!isRefreshTemplates) return;
    handleGetTemplateVariants();
    setIsRefreshTemplates(false);
  }, [handleGetTemplateVariants, isRefreshTemplates]);

  return (
    <div className="mb-6">
      <label className="block pb-2">
        <strong className="text-error">*</strong>Product Properties
      </label>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={properties.length >= 2 ? handlePropertyDragEnd : undefined}
      >
        <SortableContext
          items={properties.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {properties.map((property, index) => {
            return (
              <SortableItem key={property.id} id={property.id}>
                {({ attributes, listeners }) => (
                  <Card
                    size="small"
                    className={clsx(index !== properties.length - 1 && 'mb-6')}
                    title={
                      <Space className="flex w-full items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          {properties.length >= 2 && (
                            <DragHandle
                              attributes={attributes}
                              listeners={listeners}
                            />
                          )}
                          <span className="font-semibold">
                            {'Property: ' + property.name ||
                              `Property ${index + 1}`}
                          </span>
                        </div>

                        <div>
                          {property.mode === 'edit' ? (
                            <>
                              <Space>
                                <Button
                                  disabled={
                                    !property.name ||
                                    property.values.length === 0
                                  }
                                  htmlType="button"
                                  size="small"
                                  type="primary"
                                  onClick={() => {
                                    const viewModeProps = properties.filter(
                                      p => p.mode === 'view'
                                    );

                                    const isDuplicateName = viewModeProps.some(
                                      p =>
                                        p.name.trim().toLowerCase() ===
                                        property.name.trim().toLowerCase()
                                    );

                                    if (isDuplicateName) {
                                      void message.error(
                                        `Duplicate property name "${property.name}"`
                                      );
                                      return;
                                    }

                                    const currentPropertyValuesCount =
                                      property.values.length;

                                    const variantsCount =
                                      properties
                                        .filter(p => p.mode === 'view')
                                        .reduce(
                                          (acc, prop) =>
                                            acc * (prop.values.length || 1),
                                          1
                                        ) * currentPropertyValuesCount;

                                    if (variantsCount > 100) {
                                      void message.error(
                                        `Cannot create more than 100 variants. Please remove some properties!`
                                      );

                                      return;
                                    }

                                    updateProperty(index, { mode: 'view' });
                                    setIsRefreshTemplates(true);
                                  }}
                                >
                                  Done
                                </Button>

                                {properties.length > 1 && (
                                  <Button
                                    htmlType="button"
                                    size="small"
                                    type="default"
                                    danger
                                    onClick={() =>
                                      handleDelete(index, property.name)
                                    }
                                  >
                                    Delete
                                  </Button>
                                )}
                              </Space>
                            </>
                          ) : (
                            <>
                              <Button
                                htmlType="button"
                                size="small"
                                type="primary"
                                onClick={() =>
                                  updateProperty(index, { mode: 'edit' })
                                }
                              >
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </Space>
                    }
                  >
                    {property.mode === 'view' ? (
                      <div className="flex flex-wrap gap-1">
                        {property.values.map(val => (
                          <Tag key={val}>{val}</Tag>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block pb-2">
                            <strong className="text-error">*</strong>Property
                            name
                          </label>
                          <Input
                            placeholder="Eg. Color, Size, Material"
                            value={property.name}
                            onChange={e =>
                              updateProperty(index, { name: e.target.value })
                            }
                            maxLength={20}
                            showCount
                          />
                        </div>
                        <div>
                          <label className="block pb-2">
                            <strong className="text-error">*</strong>Property
                            values
                          </label>
                          <input
                            placeholder="Type value & press Enter to confirm a value"
                            maxLength={30}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (!val) return;

                                const currentVals = property.values;
                                if (currentVals.includes(val)) {
                                  message.warning('Value must be unique!');
                                  e.currentTarget.value = '';
                                  return;
                                }

                                updateProperty(index, {
                                  values: [...property.values, val],
                                });
                                e.currentTarget.value = '';
                              }
                            }}
                            className="mb-6 block w-full rounded border border-[#d9d9d9] px-3 py-2 outline-none transition placeholder:text-[#d9d9d9] focus:border-primary"
                          />
                          {/* Editable list with drag handles */}
                          <div className="mt-2">
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={e => handleValueDragEnd(index, e)}
                            >
                              <SortableContext
                                items={property.values}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="flex flex-wrap gap-4">
                                  {property.values.map(val => (
                                    <SortableItem key={val} id={val}>
                                      {({ attributes, listeners }) => (
                                        <div className="bg- mb-1 flex items-center justify-between gap-2 rounded-[4px] bg-gray-300 p-1">
                                          <DragHandle
                                            attributes={attributes}
                                            listeners={listeners}
                                          />
                                          <div
                                            className="max-w-25 truncate"
                                            title={val}
                                          >
                                            {val}
                                          </div>

                                          <X
                                            className="ml-auto cursor-pointer"
                                            width={16}
                                            height={16}
                                            onClick={() => {
                                              const newValues =
                                                property.values.filter(
                                                  v => v !== val
                                                );

                                              updateProperty(index, {
                                                values: newValues,
                                              });
                                            }}
                                          />
                                        </div>
                                      )}
                                    </SortableItem>
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>

      {properties.length < 3 && (
        <Button
          type="dashed"
          block
          className="mt-3"
          disabled={properties.length >= 3}
          onClick={addProperty}
        >
          <Plus width={16} height={16} /> Add New Property
        </Button>
      )}
    </div>
  );
};

export default ProductDetailPropertyConfig;
