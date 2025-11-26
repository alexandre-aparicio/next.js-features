import { DraggableItem, FieldConfig, GridLayout } from './types';

export const getColorById = (id: number, customColor?: string): string => {
  if (customColor) return customColor;
  
  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];
  return colors[id % colors.length];
};

export interface LayoutFieldGroup {
  className: string;
  fields: Record<string, FieldConfig & { className: string }>;
}

export const getAllFieldsFromDropZones = (items: DraggableItem[], layouts: GridLayout[]): LayoutFieldGroup[] => {
  const sortedLayouts = [...layouts].sort((a, b) => a.order - b.order);
  
  const layoutGroups: LayoutFieldGroup[] = [];

  sortedLayouts.forEach((layout, layoutIndex) => {
    // Calcular el offset de zonas para este layout
    const zoneOffset = sortedLayouts.slice(0, layoutIndex).reduce(
      (total, l) => total + (l.columns * l.rows), 0
    );
    
    const zoneCount = layout.columns * layout.rows;
    
    // Encontrar todos los items en las zonas de este layout
    const itemsInThisLayout = items.filter(item => 
      item.isRectangle && 
      item.dropZoneIndex !== undefined &&
      item.dropZoneIndex >= zoneOffset &&
      item.dropZoneIndex < zoneOffset + zoneCount
    );

    // Si hay items en este layout, crear el grupo
    if (itemsInThisLayout.length > 0) {
      const fields: Record<string, FieldConfig & { className: string }> = {};
      
      itemsInThisLayout.forEach((item, itemIndex) => {
        if (item.dropZoneIndex === undefined) return;
        
        const relativeIndex = item.dropZoneIndex - zoneOffset;
        const fieldKey = item.fields.label 
          ? item.fields.label.toLowerCase().replaceAll(" ", "")
          : `field${item.id}`;
        
        // Determinar la clase CSS basada en la posición en el grid
        let className = "";
        if (layout.columns === 1) {
          className = "col-span-1";
        } else if (layout.columns === 2) {
          className = "col-span-1";
        } else if (layout.columns === 3) {
          className = "col-span-1";
        }
        
        fields[fieldKey] = {
          ...item.fields,
          className
        };
      });

      layoutGroups.push({
        className: `grid grid-cols-${layout.columns} gap-4`,
        fields
      });
    }
  });

  return layoutGroups;
};