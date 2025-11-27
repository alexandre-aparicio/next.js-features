'use client';

import React from 'react';

interface Props {
  formFields: string[];
  selectedField: string;
  onSelectField: (field: string) => void;
}

export const FieldSelector: React.FC<Props> = ({ formFields, selectedField, onSelectField }) => {
  if (formFields.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-2">Selecciona un campo</h2>
      <div className="flex gap-2 flex-wrap">
        {formFields.map((f) => (
          <button
            key={f}
            onClick={() => onSelectField(f)}
            className={`px-4 py-2 rounded ${
              selectedField === f ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};
