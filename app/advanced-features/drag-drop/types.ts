export interface FieldConfig {
  label: string;
  placeholder: string;
  type: string;
}

export interface DraggableItem {
  id: number;
  x: number;
  y: number;
  isRectangle: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  fields: FieldConfig;
  dropZoneIndex?: number;
  customColor?: string;
}

export interface GridLayout {
  id: number;
  columns: number;
  rows: number;
  order: number;
}

// Añadir esta interfaz para los grupos de layout
export interface LayoutFieldGroup {
  className: string;
  fields: Record<string, FieldConfig & { className: string }>;
}

