// components/RightPanel.tsx
'use client';

import React from 'react';
import { Tab, Row, OccupiedSpaces, FormStructure, LogEntry, SquareOption } from './drag-drop';

interface RightPanelProps {
  tabs: Tab[];
  activeTab: string;
  occupiedSpaces: OccupiedSpaces;
  getSquareById: (id: string) => any;
  setActiveTab: (tabId: string) => void;
  createTab: () => void;
  addRow: (spaces: number) => void;
  deleteRow: (rowId: string) => void;
  deleteTab: (tabId: string, e: React.MouseEvent) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, tabId: string, rowId: string, spaceIndex: number) => void;
  removeSquareFromSpace: (tabId: string, rowId: string, spaceIndex: number) => void;
}

export default function RightPanel({
  tabs,
  activeTab,
  occupiedSpaces,
  getSquareById,
  setActiveTab,
  createTab,
  addRow,
  deleteRow,
  deleteTab,
  handleDragOver,
  handleDrop,
  removeSquareFromSpace
}: RightPanelProps) {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Panel Derecho</h2>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={createTab}
        >
          Crear Pestaña
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => addRow(1)}
        >
          1 Espacio
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => addRow(2)}
        >
          2 Espacios
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => addRow(3)}
        >
          3 Espacios
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`relative px-4 py-2 cursor-pointer border border-transparent border-b-0 rounded-t-lg transition-colors mr-1 mb-1 ${
              activeTab === tab.id 
                ? 'bg-white border-gray-300 text-gray-800 font-semibold' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
            {tabs.length > 1 && (
              <button
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
                onClick={(e) => deleteTab(tab.id, e)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabs.map((tab) => (
          <div key={tab.id} className={`${activeTab === tab.id ? 'block' : 'hidden'}`}>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Contenido de {tab.name}
            </h3>
            
            {tab.rows.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                No hay filas creadas. Usa los botones de arriba para agregar filas.
              </div>
            ) : (
              <div className="space-y-4">
                {tab.rows.map((row, rowIndex) => {
                  const spaceKey = `${tab.id}-${row.id}`;
                  const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
                  
                  return (
                    <div key={row.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Fila {rowIndex + 1} - {row.spaces} espacio(s)
                        </span>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors"
                          onClick={() => deleteRow(row.id)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex gap-3">
                        {Array.from({ length: row.spaces }, (_, spaceIndex) => {
                          const squareId = rowSpaces[spaceIndex];
                          const square = getSquareById(squareId);
                          
                          return (
                            <div
                              key={spaceIndex}
                              className="flex-1 min-h-[80px] border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white transition-colors hover:bg-gray-100"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, tab.id, row.id, spaceIndex)}
                            >
                              {squareId ? (
                                <div className="bg-blue-100 border border-blue-300 rounded-md px-3 py-2 w-full flex flex-col items-center justify-between">
                                  <span className="font-mono font-bold text-blue-700 mb-1 text-xs">
                                    {squareId}
                                  </span>
                                  {square && (
                                    <div className="text-xs text-center">
                                      <div className="text-green-600 font-medium">Type: {square.inputValue}</div>
                                      <div className="text-gray-600">Label: {square.label}</div>
                                      <div className="text-gray-500">Placeholder: {square.placeholder}</div>
                                      {square.inputValue === 'select' && square.options.length > 0 && (
                                        <div className="text-purple-600 text-xs mt-1">
                                          Opciones: {square.options.length}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <button
                                    className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors mt-1"
                                    onClick={() => removeSquareFromSpace(tab.id, row.id, spaceIndex)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500 font-medium">
                                  Espacio {spaceIndex + 1}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
