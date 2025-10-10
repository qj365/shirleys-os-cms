/* eslint-disable @typescript-eslint/no-explicit-any */
import AppIconButton from '@/components/AppIconButton';
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
import { Check, GripVertical, Pencil, Plus, Trash, X } from 'lucide-react';
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

const ProductForm: React.FC = () => {
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

  const handleDelete = (index: number) => {
    Modal.confirm({
      title: 'Delete property?',
      content: 'Are you sure you want to delete this property?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        deleteProperty(index);
        notification.info({
          message: 'Property deleted',
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
                      <Space className="flex w-full items-center justify-between py-2">
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
                                <AppIconButton
                                  disabled={
                                    !property.name ||
                                    property.values.length === 0
                                  }
                                  htmlType="button"
                                  icon={
                                    <Check
                                      width={16}
                                      height={16}
                                      className={clsx(
                                        property.name &&
                                          property.values.length &&
                                          '!text-primary'
                                      )}
                                    />
                                  }
                                  onClick={() => {
                                    updateProperty(index, { mode: 'view' });
                                    setIsRefreshTemplates(true);
                                  }}
                                />
                                {properties.length > 1 && (
                                  <AppIconButton
                                    htmlType="button"
                                    icon={
                                      <Trash
                                        width={16}
                                        height={16}
                                        className="!text-error"
                                      />
                                    }
                                    onClick={() => handleDelete(index)}
                                  />
                                )}
                              </Space>
                            </>
                          ) : (
                            <>
                              <AppIconButton
                                htmlType="button"
                                icon={
                                  <Pencil
                                    width={16}
                                    height={16}
                                    className="!text-primary"
                                  />
                                }
                                onClick={() =>
                                  updateProperty(index, { mode: 'edit' })
                                }
                              />
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
                      <>
                        <div className="mb-6">
                          <label className="block pb-2">
                            <strong className="text-error">*</strong>Property
                            name
                          </label>
                          <Input
                            placeholder="Enter property name"
                            value={property.name}
                            onChange={e =>
                              updateProperty(index, { name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block pb-2">
                            <strong className="text-error">*</strong>Property
                            values
                          </label>
                          <input
                            placeholder="Type value & press Enter to confirm a value"
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
                                            onClick={() => handleDelete(index)}
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
                      </>
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

export default ProductForm;
