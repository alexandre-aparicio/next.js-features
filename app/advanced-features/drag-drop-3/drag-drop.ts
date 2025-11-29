// types/drag-drop.ts
export interface Position {
  x: number;
  y: number;
}

export interface SquareOption {
  id: string;
  value: string;
  label: string;
}

export interface Square {
  id: string;
  position: Position;
  isUsed: boolean;
  inputValue: string; // 'text', 'select', 'email', etc.
  label: string;
  placeholder: string;
  options: SquareOption[]; // Nuevo: opciones para select
}

export interface Tab {
  id: string;
  name: string;
  rows: Row[];
}

export interface Row {
  id: string;
  spaces: number;
}

export interface OccupiedSpaces {
  [key: string]: string[];
}

export interface FormStructure {
  pagina: string;
  filas: {
    className: string;
    fields: {
      [key: string]: {
        label: string;
        type: string;
        placeholder: string;
        className: string;
        options?: SquareOption[]; // Nuevo: opciones para select en el formulario
        validate?: {
          required?: boolean;
          min4?: boolean;
        };
      };
    };
  }[];
}

export interface LogEntry {
  tabId: string;
  spaces: { [key: string]: string[] };
  squareIds: string[];
}