'use client';

import React, { useState } from 'react';

interface Props {
  formFields: string[];
  selectedField: string;
  onSelectField: (field: string) => void;
}

export const FieldSelector: React.FC<Props> = ({
  formFields,
  selectedField,
  onSelectField,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>('bar');

  const handleIconClick = (iconName: string) => {
    setSelectedIcon(iconName);
    console.log(`campo ${selectedField} -> icono ${iconName}`);
  };

  const handleFieldClick = (field: string) => {
    onSelectField(field);
    setSelectedIcon('bar'); // Reset al primer icono cuando cambia el campo
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Selecciona un campo</h2>

      <div className="flex gap-2 flex-wrap">
        {formFields.map((f) => (
          <div key={f} className="relative flex flex-col items-center">
            <button
              onClick={() => handleFieldClick(f)}
              className={`px-4 py-2 rounded border-2 ${
                selectedField === f
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {f}
            </button>

            {/* Iconos que solo se muestran para el campo seleccionado actualmente */}
            {selectedField === f && (
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => handleIconClick('bar')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm border-2 ${
                    selectedIcon === 'bar'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Gráfico de Barras"
                >
                  📊
                </button>
                <button
                  onClick={() => handleIconClick('donut')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm border-2 ${
                    selectedIcon === 'donut'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Gráfico Donut"
                >
                  🍩
                </button>
                <button
                  onClick={() => handleIconClick('tree')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm border-2 ${
                    selectedIcon === 'tree'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Gráfico de Árbol"
                >
                  🌳
                </button>
                <button
                  onClick={() => handleIconClick('pie')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm border-2 ${
                    selectedIcon === 'pie'
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Gráfico Circular"
                >
                  ⭕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};