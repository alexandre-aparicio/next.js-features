// app/advanced-features/drag-drop/useLayoutActions.ts
import { DraggableItem, GridLayout } from "./types";

interface UseLayoutActionsProps {
  layouts: GridLayout[];
  setLayouts: React.Dispatch<React.SetStateAction<GridLayout[]>>;
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
}

export const useLayoutActions = ({ layouts, setLayouts, setItems }: UseLayoutActionsProps) => {
  const freeAllItemsCompletely = () => {
    setItems(prevItems =>
      prevItems.map(item => {
        const newX = 20 + Math.random() * 300;
        const newY = 20 + Math.random() * 300;

        const updatedItem = {
          ...item,
          x: newX,
          y: newY,
          isRectangle: false,
          dropZoneIndex: undefined,
        };

        if (item.ref.current) {
          item.ref.current.style.transform = `translate(${newX}px, ${newY}px)`;
          item.ref.current.style.transition = "all 0.2s";
          delete item.ref.current.dataset.interactInitialized;
        }

        return updatedItem;
      })
    );

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

  return {
    addLayout,
    removeLayout,
    moveLayout,
    freeAllItemsCompletely
  };
};