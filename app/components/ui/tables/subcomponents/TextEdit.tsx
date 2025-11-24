// components/edit-components/TextEdit.tsx

import { useState, useEffect } from "react";

interface TextEditProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function TextEdit({ value, onSave, onCancel }: TextEditProps) {
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <input
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  );
}