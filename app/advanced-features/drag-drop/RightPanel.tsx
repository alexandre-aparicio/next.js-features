import { useState } from "react";
import { DraggableItem, GridLayout } from "./types";

interface RightPanelProps {
  layouts: GridLayout[];
  setLayouts: React.Dispatch<React.SetStateAction<GridLayout[]>>;
  occupiedZones: number[];
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
}

export const RightPanel = ({ layouts, setLayouts, occupiedZones, setItems }: RightPanelProps) => {
  const [draggedLayoutId, setDraggedLayoutId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const freeAllItemsCompletely = () => {
    setItems(prevItems =>
      prevItems.map(item => {
        // Crear nueva posición aleatoria
        const newX = 20 + Math.random() * 300;
        const newY = 20 + Math.random() * 300;

        return {
          ...item,
          x: newX,
          y: newY,
          isRectangle: false, // ← FORZAR a que sea formulario
          dropZoneIndex: undefined, // ← LIMPIAR completamente la zona
          
          // Reset visual inmediato si el elemento existe en el DOM
          ...(item.ref.current && {
            ref: {
              ...item.ref,
              current: (() => {
                const element = item.ref.current;
                if (element) {
                  // Reset visual del elemento
                  element.style.transform = `translate(${newX}px, ${newY}px)`;
                  element.style.transition = "all 0.2s";
                  // Limpiar cualquier dato de interact
                  delete element.dataset.interactInitialized;
                }
                return element;
              })()
            }
          })
        };
      })
    );

    // FORZAR un re-render adicional para asegurar que el estado se actualice
    setTimeout(() => {
      setItems(currentItems => [...currentItems]);
    }, 50);
  };

  const addLayout = (columns: number) => {
    const newLayout: GridLayout = {
      id: Date.now(),
      columns,
      rows: 1,
      order: layouts.length
    };
    setLayouts(prev => [...prev, newLayout]);
  };

  const removeLayout = (id: number) => {
    // LIBERA ABSOLUTAMENTE TODOS LOS ITEMS
    freeAllItemsCompletely();

    setLayouts(prev => {
      const filtered = prev.filter(layout => layout.id !== id);
      return filtered.map((layout, index) => ({
        ...layout,
        order: index
      }));
    });
  };

  const moveLayout = (fromIndex: number, toIndex: number) => {
    // LIBERA ABSOLUTAMENTE TODOS LOS ITEMS
    freeAllItemsCompletely();

    const sortedCurrent = [...layouts].sort((a, b) => a.order - b.order);
    const updatedLayouts = [...sortedCurrent];
    const [movedLayout] = updatedLayouts.splice(fromIndex, 1);
    updatedLayouts.splice(toIndex, 0, movedLayout);

    const reorderedLayouts = updatedLayouts.map((layout, index) => ({
      ...layout,
      order: index
    }));

    setLayouts(reorderedLayouts);
  };

  const sortedLayouts = [...layouts].sort((a, b) => a.order - b.order);

  const getDropZoneIndexOffset = (layoutArray: GridLayout[], layoutIndex: number) => {
    return layoutArray.slice(0, layoutIndex).reduce(
      (total, layout) => total + layout.columns * layout.rows,
      0
    );
  };

  // DRAG AND DROP EVENTS
  const handleDragStart = (e: React.DragEvent, layoutId: number) => {
    setDraggedLayoutId(layoutId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", layoutId.toString());

    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedLayoutId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedLayoutId === null) return;

    const draggedIndex = sortedLayouts.findIndex(l => l.id === draggedLayoutId);

    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
      moveLayout(draggedIndex, targetIndex);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => e.preventDefault();
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 bg-white rounded-lg border-2 border-gray-300 p-4">
      {/* Botones */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(cols => (
          <button
            key={cols}
            onClick={() => addLayout(cols)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow text-sm transition-colors"
          >
            {cols} Columna{cols > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      {/* Nota */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">
          ⚠️ <strong>Atención:</strong> Al mover o eliminar cualquier layout, TODOS los elementos se resetearán y volverán al panel izquierdo.
        </p>
      </div>

      {/* Layouts */}
      <div className="space-y-4 max-h-[calc(100%-80px)] overflow-y-auto">
        {sortedLayouts.map((layout, layoutIndex) => {
          const zoneOffset = getDropZoneIndexOffset(sortedLayouts, layoutIndex);
          const isDragging = draggedLayoutId === layout.id;
          const isDropTarget = dragOverIndex === layoutIndex;

          return (
            <div
              key={layout.id}
              draggable
              onDragStart={(e) => handleDragStart(e, layout.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, layoutIndex)}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
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
                    removeLayout(layout.id);
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
        })}

        {layouts.length === 0 && (
          <div className="text-center text-gray-500 py-8">Selecciona un layout para comenzar</div>
        )}
      </div>
    </div>
  );
};