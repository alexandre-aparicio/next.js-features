export interface DraggableItem {
  id: number;
  x: number;
  y: number;
  isRectangle: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  fields: {
    label: string;
    placeholder: string;
    type: string;
    [key: string]: any;
  };
  dropZoneIndex?: number;
  pageId: number;
  customColor?: string; // Añade esta línea
}

export interface FormPage {
  id: number;
  name: string;
  items: DraggableItem[];
}