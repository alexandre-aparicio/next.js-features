// components/EditableCell.tsx
import { useState, useEffect } from "react";

interface EditableCellProps<T> {
  value: any;
  row: T;
  columnId: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: any) => void;
  onCancel: () => void;
  editComponent?: React.ComponentType<any>;
}

export function EditableCell<T>({
  value,
  row,
  columnId,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  editComponent: EditComponent
}: EditableCellProps<T>) {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value, isEditing]);

  const handleSave = (newValue: any) => {

    onSave(newValue);
  };

  const handleStartEdit = () => {
    onStartEdit();
  };

  // Si hay un componente personalizado
  if (isEditing && EditComponent) {
    return (
      <EditComponent
        value={editValue}
        row={row}
        onSave={handleSave}
        onCancel={onCancel}
      />
    );
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleSave(editValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave(editValue);
          else if (e.key === 'Escape') onCancel();
        }}
        autoFocus
        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    );
  }

  return (
    <div 
      onClick={handleStartEdit}
      className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
      title="Haz clic para editar"
    >
      {value}
    </div>
  );
}