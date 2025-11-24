import { useState } from "react";

export interface EditingState<T> {
  rowId: any;
  columnId: string;
  value: any;
  originalValue: any;
}

export function useTableEditing<T>() {
  const [editing, setEditing] = useState<EditingState<T> | null>(null);

  const startEditing = (rowId: any, columnId: string, initialValue: any) => {
    setEditing({
      rowId,
      columnId,
      value: initialValue,
      originalValue: initialValue
    });
  };

  const stopEditing = () => {
    setEditing(null);
  };

  /** Actualiza el valor mientras el usuario escribe */
  const updateEditingValue = (newValue: any) => {
    if (!editing) return;
    setEditing(prev => prev ? { ...prev, value: newValue } : null);
  };

  /** Confirma la edición y devuelve el nuevo valor */
  const confirmEditing = () => {
    if (!editing) return null;

    const finalValue = editing.value;
    setEditing(null);
    return finalValue;
  };

  const isEditing = (rowId: any, columnId: string) => {
    return editing?.rowId === rowId && editing?.columnId === columnId;
  };

  return {
    editing,
    startEditing,
    stopEditing,
    updateEditingValue,
    confirmEditing,
    isEditing,
  };
}
