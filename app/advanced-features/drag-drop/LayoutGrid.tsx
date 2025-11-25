// app/advanced-features/drag-drop/LayoutGrid.tsx
import { GridLayout } from "./types";
import { LayoutItem } from "./LayoutItem";

interface LayoutGridProps {
  layouts: GridLayout[];
  occupiedZones: number[];
  draggedLayoutId: number | null;
  dragOverIndex: number | null;
  onDragStart: (layoutId: number) => void;
  onDragEnd: () => void;
  onDragOver: (index: number) => void;
  onRemoveLayout: (id: number) => void;
  onMoveLayout: (fromIndex: number, toIndex: number) => void;
}

export const LayoutGrid = ({
  layouts,
  occupiedZones,
  draggedLayoutId,
  dragOverIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onRemoveLayout,
  onMoveLayout
}: LayoutGridProps) => {
  const getDropZoneIndexOffset = (layoutArray: GridLayout[], layoutIndex: number) => {
    return layoutArray.slice(0, layoutIndex).reduce(
      (total, layout) => total + layout.columns * layout.rows,
      0
    );
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedLayoutId === null) return;

    const draggedIndex = layouts.findIndex(l => l.id === draggedLayoutId);

    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      onDragOver(targetIndex);
      onMoveLayout(draggedIndex, targetIndex);
    }
  };

  return (
    <div className="space-y-4 max-h-[calc(100%-80px)] overflow-y-auto">
      {layouts.map((layout, layoutIndex) => {
        const zoneOffset = getDropZoneIndexOffset(layouts, layoutIndex);

        return (
          <LayoutItem
            key={layout.id}
            layout={layout}
            zoneOffset={zoneOffset}
            occupiedZones={occupiedZones}
            isDragging={draggedLayoutId === layout.id}
            isDropTarget={dragOverIndex === layoutIndex}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={(e) => handleDragOver(e, layoutIndex)}
            onRemoveLayout={onRemoveLayout}
          />
        );
      })}
    </div>
  );
};