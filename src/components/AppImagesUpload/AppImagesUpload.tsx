import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import clsx from 'clsx';

interface Item {
  id: string;
  content: string;
}

export default function AppImagesUpload() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
    { id: '4', content: 'Item 4' },
    { id: '5', content: 'Item 5' },
    { id: '6', content: 'Item 6' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems(prevItems => {
        const oldIndex = prevItems.findIndex(item => item.id === active.id);
        const newIndex = prevItems.findIndex(item => item.id === over.id);
        const newItems = [...prevItems];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Drag and Drop Grid List</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={item.id} className={clsx(index === 0 && 'row-span-2')}>
                <SortableItem id={item.id} content={item.content} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
