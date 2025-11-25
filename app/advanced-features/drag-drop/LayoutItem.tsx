// app/advanced-features/drag-drop/LayoutItem.tsx
import { GridLayout } from "./types";

interface LayoutItemProps {
  layout: GridLayout;
  zoneOffset: number;
  occupiedZones: number[];
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (layoutId: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveLayout: (id: number) => void;
}

export const LayoutItem = ({
  layout,
  zoneOffset,
  occupiedZones,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onRemoveLayout
}: LayoutItemProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(layout.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", layout.id.toString());

    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) onDragEnd();
      }}
      onDrop={(e) => e.preventDefault()}
      className={`layout-item border-2 rounded-lg p-3 bg-white cursor-move transition-all duration-200 ${
        isDragging
          ? "border-blue-400 scale-95"
          : isDropTarget
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 hover:shadow-md"
      }`}
      style={{ transition: "all 0.2s ease" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 cursor-grab active:cursor-grabbing">⋮⋮</span>
          <span className="text-sm text-gray-600 font-medium">
            {layout.columns} columna{layout.columns > 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveLayout(layout.id);
          }}
          className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
          title="Eliminar layout (reseteará todos los elementos)"
        >
          ×
        </button>
      </div>

      {/* Zonas */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0,1fr))` }}
      >
        {Array.from({ length: layout.columns * layout.rows }).map((_, index) => {
          const zoneIndex = zoneOffset + index;
          const isOccupied = occupiedZones.includes(zoneIndex);

          return (
            <div
              key={index}
              className={`drop-zone border-2 border-dashed rounded min-h-[60px] flex items-center justify-center transition-all ${
                isOccupied
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
              data-zone-index={zoneIndex}
            >
              {isOccupied ? (
                <div className="text-green-600 text-xs font-medium">✓ Ocupado</div>
              ) : (
                <div className="text-gray-400 text-xs">Zona {zoneIndex}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};