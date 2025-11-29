// components/LeftPanel.tsx
import { useState } from 'react';
import { Square, SquareOption } from './drag-drop';

interface LeftPanelProps {
  availableSquares: Square[];
  onCreateSquare: () => void;
  onUpdateSquareInput: (squareId: string, value: string) => void;
  onUpdateSquareLabel: (squareId: string, value: string) => void;
  onUpdateSquarePlaceholder: (squareId: string, value: string) => void;
  onAddSquareOption: (squareId: string, option: SquareOption) => void;
  onUpdateSquareOption: (squareId: string, optionId: string, updates: Partial<SquareOption>) => void;
  onDeleteSquareOption: (squareId: string, optionId: string) => void;
  onDeleteSquare: (squareId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, squareId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function LeftPanel({
  availableSquares,
  onCreateSquare,
  onUpdateSquareInput,
  onUpdateSquareLabel,
  onUpdateSquarePlaceholder,
  onAddSquareOption,
  onUpdateSquareOption,
  onDeleteSquareOption,
  onDeleteSquare,
  onDragStart,
  onDragEnd
}: LeftPanelProps) {
  const [newOptionValues, setNewOptionValues] = useState<{ [key: string]: string }>({});

  const handleAddOption = (squareId: string) => {
    const value = newOptionValues[squareId]?.trim();
    if (!value) return;

    const newOption: SquareOption = {
      id: Math.random().toString(36).substr(2, 9),
      value: value,
      label: value
    };

    onAddSquareOption(squareId, newOption);
    setNewOptionValues(prev => ({ ...prev, [squareId]: '' }));
  };

  const handleOptionKeyPress = (e: React.KeyboardEvent, squareId: string) => {
    if (e.key === 'Enter') {
      handleAddOption(squareId);
    }
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Panel Izquierdo</h2>
      <button 
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
        onClick={onCreateSquare}
      >
        Crear Cuadrado
      </button>
      
      <div className="relative min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        {availableSquares.map((square, index) => (
          <div
            key={square.id}
            className="absolute w-64 h-auto flex flex-col items-center justify-center rounded-lg cursor-move select-none shadow-md transition-all bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm p-3"
            draggable={true}
            onDragStart={(e) => onDragStart(e, square.id)}
            onDragEnd={onDragEnd}
            style={{
              left: `${square.position.x}px`,
              top: `${50 + index * 180}px`
            }}
          >
            <span className="mb-2 text-xs font-mono bg-blue-700 px-2 py-1 rounded">
              {square.id}
            </span>
            
            {/* Select para tipo de input */}
            <select
              value={square.inputValue}
              onChange={(e) => onUpdateSquareInput(square.id, e.target.value)}
              className="w-full px-2 py-1 text-xs text-black rounded border-none mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="password">Password</option>
              <option value="tel">Teléfono</option>
              <option value="date">Fecha</option>
            </select>
            
            <input
              type="text"
              value={square.label}
              onChange={(e) => onUpdateSquareLabel(square.id, e.target.value)}
              placeholder="Label..."
              className="w-full px-2 py-1 text-xs text-black rounded border-none mb-2"
              onClick={(e) => e.stopPropagation()}
            />
            
            <input
              type="text"
              value={square.placeholder}
              onChange={(e) => onUpdateSquarePlaceholder(square.id, e.target.value)}
              placeholder="Placeholder..."
              className="w-full px-2 py-1 text-xs text-black rounded border-none mb-2"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Sección de opciones para select */}
            {square.inputValue === 'select' && (
              <div className="w-full bg-blue-400 rounded p-2 mb-2">
                <div className="text-xs font-semibold mb-2 text-white">Opciones:</div>
                
                {/* Lista de opciones existentes */}
                {square.options.map((option, optIndex) => (
                  <div key={option.id} className="flex items-center gap-1 mb-1">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => onUpdateSquareOption(square.id, option.id, { 
                        label: e.target.value,
                        value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                      })}
                      placeholder="Opción..."
                      className="flex-1 px-2 py-1 text-xs text-black rounded border-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSquareOption(square.id, option.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Agregar nueva opción */}
                <div className="flex items-center gap-1 mt-2">
                  <input
                    type="text"
                    value={newOptionValues[square.id] || ''}
                    onChange={(e) => setNewOptionValues(prev => ({ 
                      ...prev, 
                      [square.id]: e.target.value 
                    }))}
                    onKeyPress={(e) => handleOptionKeyPress(e, square.id)}
                    placeholder="Nueva opción..."
                    className="flex-1 px-2 py-1 text-xs text-black rounded border-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded text-xs flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddOption(square.id);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            <button
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSquare(square.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        {availableSquares.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No hay cuadrados disponibles
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Cuadrados disponibles: {availableSquares.length}
      </div>
    </div>
  );
}