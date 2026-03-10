import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid #ccc',
    margin: '8px 0',
    padding: '8px',
    backgroundColor: 'white',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ cursor: 'grab', marginBottom: '4px' }} aria-label="drag handle">⋮⋮</div>
      {children}
    </div>
  );
}

function Dashboard() {
  const [items, setItems] = React.useState([
    { id: 'revenue', content: <><h2>Revenue</h2><p>$0</p></> },
    { id: 'pending', content: <><h2>Pending Tasks</h2><ul><li>Register your first content</li><li>Verify your email</li><li>Connect your wallet</li></ul></> },
    { id: 'performance', content: <><h2>Content Performance</h2><p>Views: 0</p><p>Likes: 0</p><p>Earnings: $0</p></> },
    { id: 'ai', content: <><h2>AI Activity Log</h2><p>Generated a social post</p><p>Suggested a title for your video</p></> },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = [...items];
        const [moved] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, moved);
        return newItems;
      });
    }
  };

  return (
    <div>
      <h1>Welcome to your dashboard</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {item.content}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default Dashboard;
