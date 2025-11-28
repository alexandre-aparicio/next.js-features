'use client';

import React from 'react';

interface Props {
  formFields: string[];
  selectedField: string;
  onSelectField: (field: string) => void;
  onOpenModal?: (field: string, type?: string) => void;
}

export const FieldSelector: React.FC<Props> = ({
  formFields,
  selectedField,
  onSelectField,
  onOpenModal,
}) => {
  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Selecciona un campo</h2>

      <div className="flex gap-2 flex-wrap">
        {formFields.map((f) => (
          <div key={f} className="relative">
            <button
              onClick={() => onSelectField(f)}
              className={`px-4 py-2 rounded ${
                selectedField === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {f}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};