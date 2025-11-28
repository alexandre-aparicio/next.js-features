'use client';

import React from 'react';

interface Props {
  formFields: string[];
  xAxisField: string;
  yAxisField: string;
  onSelectXAxis: (field: string) => void;
  onSelectYAxis: (field: string) => void;
}

export const StackedChartSelector: React.FC<Props> = ({
  formFields,
  xAxisField,
  yAxisField,
  onSelectXAxis,
  onSelectYAxis
}) => {
  if (formFields.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Gráfico de Columnas Apiladas</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eje X:</label>
          <select
            value={xAxisField}
            onChange={(e) => onSelectXAxis(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un campo</option>
            {formFields.map((f) => (
              <option key={`x-${f}`} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eje Y:</label>
          <select
            value={yAxisField}
            onChange={(e) => onSelectYAxis(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un campo</option>
            {formFields.map((f) => (
              <option key={`y-${f}`} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
