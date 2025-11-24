// components/edit-components/PriceEdit.tsx
import { useState, useEffect } from "react";

interface PriceEditProps {
  value: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}

export function PriceEdit({ value, onSave, onCancel }: PriceEditProps) {
  const [editValue, setEditValue] = useState(value.toString());
  const [error, setError] = useState("");

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    const numericValue = parseFloat(editValue);

    if (isNaN(numericValue)) {
      setError("Por favor ingresa un número válido");
      return;
    }

    if (numericValue < 0) {
      setError("El monto no puede ser negativo");
      return;
    }

    setError("");
    onSave(numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (/^\d*\.?\d*$/.test(newValue)) {
      setEditValue(newValue);
      setError("");
    }
  };

  // Seleccionar todo el texto al enfocar
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div>
      <input
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        autoFocus
        className="w-20 border-none focus:outline-none bg-transparent"
      />
      {error && (
        <div className="text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}