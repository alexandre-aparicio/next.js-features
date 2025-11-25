// app/advanced-features/drag-drop/RightPanel.tsx
import { useState } from "react";
import { DraggableItem, GridLayout } from "./types";
import { LayoutHeader } from "./LayoutHeader";
import { LayoutGrid } from "./LayoutGrid";
import { useLayoutActions } from "./useLayoutActions";

interface RightPanelProps {
  layouts: GridLayout[];
  setLayouts: React.Dispatch<React.SetStateAction<GridLayout[]>>;
  occupiedZones: number[];
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
}

export const RightPanel = ({ layouts, setLayouts, occupiedZones, setItems }: RightPanelProps) => {
  const [draggedLayoutId, setDraggedLayoutId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { addLayout, removeLayout, moveLayout, freeAllItemsCompletely } = useLayoutActions({
    layouts,
    setLayouts,
    setItems
  });

  const sortedLayouts = [...layouts].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-white rounded-lg border-2 border-gray-300 p-4">
      <LayoutHeader onAddLayout={addLayout} />
      
     

      <LayoutGrid
        layouts={sortedLayouts}
        occupiedZones={occupiedZones}
        draggedLayoutId={draggedLayoutId}
        dragOverIndex={dragOverIndex}
        onDragStart={setDraggedLayoutId}
        onDragEnd={() => {
          setDraggedLayoutId(null);
          setDragOverIndex(null);
        }}
        onDragOver={setDragOverIndex}
        onRemoveLayout={removeLayout}
        onMoveLayout={moveLayout}
      />

      {layouts.length === 0 && (
        <div className="text-center text-gray-500 py-8">Selecciona un layout para comenzar</div>
      )}
    </div>
  );
};