import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableItemProps = {
  id: string;
  content: string;
};

export default function SortableItem({ id, content }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex h-full min-h-25 w-full cursor-move touch-none items-center justify-center rounded-lg border border-blue-300 bg-blue-100 p-4 text-center"
    >
      {content}
    </div>
  );
}
