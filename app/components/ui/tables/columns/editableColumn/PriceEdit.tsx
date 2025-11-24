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
    
    // Permitir solo números y un punto decimal
    if (/^\d*\.?\d*$/.test(newValue)) {
      setEditValue(newValue);
      setError("");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <span className="text-gray-500 mr-1">$</span>
        <input
          type="text"
          value={editValue}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-24 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="0.00"
        />
      </div>
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}