// import React, { useState } from 'react';
// import { Form, Input, Button, Card, message, Tag } from 'antd';
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

// const { Item: FormItem } = Form;

// interface Property {
//   name: string;
//   values: string[];
// }

// const SortableItem: React.FC<{
//   id: number | string;
//   children: React.ReactNode;
// }> = ({ id, children }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: '8px',
//     margin: '4px 0',
//     backgroundColor: '#f5f5f5',
//     borderRadius: '4px',
//     display: 'flex',
//     alignItems: 'center',
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {children}
//     </div>
//   );
// };

// const PropertiesForm: React.FC = () => {
//   const form = Form.useFormInstance();
//   const [modes, setModes] = useState<string[]>(['edit']);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   const handleOuterDragEnd = (event: any) => {
//     const { active, over } = event;
//     if (active.id !== over?.id) {
//       const fields = form.getFieldValue('properties') || []; // Wait, no: fields from Form.List are the list, but to find indices
//       // Actually, since we need indices based on current fields order
//       // But Form.List provides fields array with .name as index
//       // Wait, in the component, we need to pass fields to handle, but since closure, wait.
//       // Better to get current properties length, but to find old/new index, since ids are current indices 0,1,2...
//       // active.id and over.id are numbers 0,1,2 as current positions.
//       const oldIndex = active.id as number;
//       const newIndex = over?.id as number;
//       if (typeof newIndex === 'number') {
//         const currentProps = form.getFieldValue('properties') || [];
//         const newProps = arrayMove(currentProps, oldIndex, newIndex);
//         form.setFieldsValue({ properties: newProps });

//         setModes(prev => arrayMove(prev, oldIndex, newIndex));
//       }
//     }
//   };

//   const handleInnerDragEnd = (propIndex: number, event: any) => {
//     const { active, over } = event;
//     if (active.id !== over?.id) {
//       const oldIdx = active.id as number;
//       const newIdx = over?.id as number;
//       if (typeof newIdx === 'number') {
//         const currentProps = form.getFieldValue('properties') || [];
//         const currentValues = currentProps[propIndex]?.values || [];
//         const newValues = arrayMove(currentValues, oldIdx, newIdx);
//         const newProps = currentProps.map((p: Property, i: number) =>
//           i === propIndex ? { ...p, values: newValues } : p
//         );
//         form.setFieldsValue({ properties: newProps });
//       }
//     }
//   };

//   const handleAddValue = (
//     propIndex: number,
//     e: React.KeyboardEvent<HTMLInputElement>
//   ) => {
//     const val = e.currentTarget.value.trim();
//     if (val) {
//       const currentProps = form.getFieldValue('properties') || [];
//       const currentValues = currentProps[propIndex]?.values || [];
//       const newProps = currentProps.map((p: Property, i: number) =>
//         i === propIndex ? { ...p, values: [...currentValues, val] } : p
//       );
//       form.setFieldsValue({ properties: newProps });
//       e.currentTarget.value = '';
//     }
//   };

//   const handleAddProperty = () => {
//     const currentProps = form.getFieldValue('properties') || [];
//     if (currentProps.length < 3) {
//       form.setFieldsValue({
//         properties: [...currentProps, { name: '', values: [] }],
//       });
//       setModes(prev => [...prev, 'edit']);
//     } else {
//       message.warning('Maximum 3 properties allowed.');
//     }
//   };

//   const handleRemoveProperty = (index: number) => {
//     const currentProps = form.getFieldValue('properties') || [];
//     if (currentProps.length > 1) {
//       const newProps = currentProps.filter((_: any, i: number) => i !== index);
//       form.setFieldsValue({ properties: newProps });
//       setModes(prev => prev.filter((_, i) => i !== index));
//     } else {
//       message.warning('At least 1 property required.');
//     }
//   };

//   const handleDone = (index: number) => {
//     const propName = form.getFieldValue(['properties', index, 'name']);
//     const propValues =
//       form.getFieldValue(['properties', index, 'values']) || [];
//     if (propName && propValues.length > 0) {
//       setModes(prev => {
//         const newModes = [...prev];
//         newModes[index] = 'view';
//         return newModes;
//       });
//     } else {
//       message.warning('Please enter property name and at least one value.');
//     }
//   };

//   const handleEdit = (index: number) => {
//     setModes(prev => {
//       const newModes = [...prev];
//       newModes[index] = 'edit';
//       return newModes;
//     });
//   };

//   return (
//     <FormItem label="Product Properties" required>
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleOuterDragEnd}
//       >
//         <SortableContext
//           items={(form.getFieldValue('properties') || []).map(
//             (_: any, i: number) => i
//           )}
//           strategy={verticalListSortingStrategy}
//         >
//           <Form.List name="properties" initialValue={[null]}>
//             {fields => (
//               <>
//                 {fields.map((field, index) => {
//                   const propIndex = field.name;
//                   const mode = modes[propIndex];
//                   const propName =
//                     form.getFieldValue(['properties', propIndex, 'name']) || '';
//                   const propValues =
//                     form.getFieldValue(['properties', propIndex, 'values']) ||
//                     [];
//                   const isValid = !!propName && propValues.length > 0;

//                   return (
//                     <SortableItem key={field.key} id={propIndex}>
//                       <Card
//                         title={
//                           mode === 'edit' ? (
//                             <FormItem
//                               name={[propIndex, 'name']}
//                               noStyle
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: 'Property name is required',
//                                 },
//                               ]}
//                             >
//                               <Input placeholder="Property name" />
//                             </FormItem>
//                           ) : (
//                             <span>{propName}</span>
//                           )
//                         }
//                         size="small"
//                         style={{ marginBottom: 16 }}
//                         extra={
//                           <div>
//                             {mode === 'edit' ? (
//                               <>
//                                 <Button
//                                   type="primary"
//                                   onClick={() => handleDone(propIndex)}
//                                   disabled={!isValid}
//                                   style={{ marginRight: 8 }}
//                                 >
//                                   Done
//                                 </Button>
//                                 {fields.length > 1 && (
//                                   <Button
//                                     type="link"
//                                     danger
//                                     icon={<DeleteOutlined />}
//                                     onClick={() =>
//                                       handleRemoveProperty(propIndex)
//                                     }
//                                   />
//                                 )}
//                               </>
//                             ) : (
//                               <Button
//                                 type="link"
//                                 icon={<EditOutlined />}
//                                 onClick={() => handleEdit(propIndex)}
//                               />
//                             )}
//                           </div>
//                         }
//                       >
//                         {mode === 'edit' ? (
//                           <>
//                             <Input
//                               placeholder="Type value and press Enter to add"
//                               onPressEnter={e => handleAddValue(propIndex, e)}
//                               style={{ marginBottom: 16, width: '100%' }}
//                             />
//                             <DndContext
//                               sensors={sensors}
//                               collisionDetection={closestCenter}
//                               onDragEnd={e => handleInnerDragEnd(propIndex, e)}
//                             >
//                               <SortableContext
//                                 items={propValues.map((_: any, i: number) => i)}
//                                 strategy={verticalListSortingStrategy}
//                               >
//                                 {propValues.map(
//                                   (value: string, vIndex: number) => (
//                                     <SortableItem key={vIndex} id={vIndex}>
//                                       <Tag style={{ cursor: 'grab' }}>
//                                         {value}
//                                       </Tag>
//                                     </SortableItem>
//                                   )
//                                 )}
//                               </SortableContext>
//                             </DndContext>
//                           </>
//                         ) : (
//                           <DndContext
//                             sensors={sensors}
//                             collisionDetection={closestCenter}
//                             onDragEnd={e => handleInnerDragEnd(propIndex, e)}
//                           >
//                             <SortableContext
//                               items={propValues.map((_: any, i: number) => i)}
//                               strategy={verticalListSortingStrategy}
//                             >
//                               <div style={{ minHeight: 40 }}>
//                                 {propValues.map(
//                                   (value: string, vIndex: number) => (
//                                     <SortableItem key={vIndex} id={vIndex}>
//                                       <Tag>{value}</Tag>
//                                     </SortableItem>
//                                   )
//                                 )}
//                               </div>
//                             </SortableContext>
//                           </DndContext>
//                         )}
//                       </Card>
//                     </SortableItem>
//                   );
//                 })}
//               </>
//             )}
//           </Form.List>
//         </SortableContext>
//       </DndContext>
//       {form.getFieldValue('properties')?.length < 3 && (
//         <Button
//           type="dashed"
//           onClick={handleAddProperty}
//           icon={<PlusOutlined />}
//           block
//         >
//           Add Property
//         </Button>
//       )}
//     </FormItem>
//   );
// };

// export default PropertiesForm;

import React, { useRef, useState } from 'react';
import { Button, Card, Form, Input, Space, Tag, message } from 'antd';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import clsx from 'clsx';

interface ProductProperty {
  id: string;
  name: string;
  values: string[];
  mode: 'edit' | 'view';
}

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
  const [form] = Form.useForm();
  const [properties, setProperties] = useState<ProductProperty[]>([
    { id: 'p1', name: '', values: [], mode: 'edit' },
  ]);

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
      setProperties(arrayMove(properties, oldIndex, newIndex));
    }
  };

  // --- Drag reorder values (only in edit mode) ---
  const handleValueDragEnd = (propertyIndex: number, e: any) => {
    const { active, over } = e;
    if (active.id !== over?.id) {
      const oldIndex = properties[propertyIndex].values.indexOf(active.id);
      const newIndex = properties[propertyIndex].values.indexOf(over.id);
      const updated = [...properties];
      updated[propertyIndex].values = arrayMove(
        updated[propertyIndex].values,
        oldIndex,
        newIndex
      );
      setProperties(updated);
    }
  };

  const handleAddProperty = () => {
    if (properties.length < 3) {
      setProperties([
        ...properties,
        { id: `p${Date.now()}`, name: '', values: [], mode: 'edit' },
      ]);
    }
  };

  const handleDeleteProperty = (idx: number) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (values: any) => {
    console.log('✅ Product:', {
      ...values,
      properties,
    });
    message.success('Product submitted! Check console for output.');
  };
  const valueInputRefs = useRef<Record<string, Input | null>>({});

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
                    className={clsx(
                      '!rounded-none border-t-0 border-gray-200',
                      index === 0 ? 'rounded-t-[6px] border-t-[1px]' : ''
                    )}
                    title={
                      <Space className="flex w-full items-center justify-between py-4">
                        <div className="flex items-center gap-2">
                          {properties.length >= 2 && (
                            <DragHandle
                              attributes={attributes}
                              listeners={listeners}
                            />
                          )}
                          <span>
                            {property.name || `Property ${index + 1}`}
                          </span>
                        </div>

                        <div>
                          {property.mode === 'edit' ? (
                            <>
                              <Space>
                                <Button
                                  type="primary"
                                  disabled={
                                    !property.name ||
                                    property.values.length === 0
                                  }
                                  onClick={() => {
                                    const updated = [...properties];
                                    updated[index].mode = 'view';
                                    setProperties(updated);
                                  }}
                                >
                                  Done
                                </Button>
                                {properties.length > 1 && (
                                  <Button
                                    danger
                                    onClick={() => handleDeleteProperty(index)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </Space>
                            </>
                          ) : (
                            <>
                              <Button
                                type="link"
                                onClick={() => {
                                  const updated = [...properties];
                                  updated[index].mode = 'edit';
                                  setProperties(updated);
                                }}
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
                      <>
                        <div className="mb-2 flex justify-between">
                          <strong>{property.name}</strong>
                        </div>

                        {/* 🔒 View mode: values displayed as tags only, no drag */}
                        <div className="flex flex-wrap gap-1">
                          {property.values.map(val => (
                            <Tag key={val}>{val}</Tag>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <Form.Item label="Property name" required>
                          <Input
                            placeholder="Enter property name"
                            value={property.name}
                            onChange={e => {
                              const updated = [...properties];
                              updated[index].name = e.target.value;
                              setProperties(updated);
                            }}
                          />
                        </Form.Item>

                        <Form.Item label="Property values" required>
                          <Input
                            placeholder="Type value & press Enter"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (!val) return;

                                const currentVals = properties[index].values;
                                if (currentVals.includes(val)) {
                                  message.warning(
                                    'Value must be unique in this property!'
                                  );
                                  e.currentTarget.value = '';
                                  return;
                                }

                                const updated = [...properties];
                                updated[index].values.push(val);
                                setProperties(updated);
                                e.currentTarget.value = '';
                              }
                            }}
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
                                        <div className="bg- mb-1 flex items-center justify-between gap-2 rounded-[4px] bg-gray-400 px-1 py-2">
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
                                            onClick={() => {
                                              const updated = [...properties];
                                              updated[index].values = updated[
                                                index
                                              ].values.filter(v => v !== val);
                                              setProperties(updated);
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
                        </Form.Item>
                      </>
                    )}
                  </Card>
                )}
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>

      <Button
        type="dashed"
        block
        className="mt-3"
        disabled={properties.length >= 3}
        onClick={handleAddProperty}
      >
        + Add Property
      </Button>
    </div>
  );
};

export default ProductForm;
