// types/TableColumnTypes.ts

export interface TableColumn<T> {
  id: keyof T | string;
  header: string;
  render: (row: T) => React.ReactNode;

  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;

  // --- Configuración de Edición ---
  editable?: boolean;

  // Componente que se usará para editar
  editComponent?: React.ComponentType<EditComponentProps<T>>;

  // Props personalizados que se pasan al editComponent
  editComponentProps?: (row: T) => Record<string, any>;

  // Callback genérico de guardado (puede o no usarse si ya tienes otro handler global)
  onEdit?: (row: T, value: any) => void;
}

export type SortDirection = "asc" | "desc" | "none";

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

// Props estándar para un componente de edición
export interface EditComponentProps<T> {
  value: any;                // El valor actual
  row: T;                    // Toda la fila
  onSave: (value: any) => void;  // Guardar
  onCancel: () => void;          // Cancelar
}
