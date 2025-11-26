// app/page.tsx
'use client';

import { useState, useRef, useCallback } from 'react';

// Definición de tipos TypeScript
interface Position {
  x: number;
  y: number;
}

interface Square {
  id: string;
  position: Position;
  isUsed: boolean;
  inputValue: string;
}

interface Tab {
  id: string;
  name: string;
  rows: Row[];
}

interface Row {
  id: string;
  spaces: number; // 1, 2 o 3 espacios
}

interface OccupiedSpaces {
  [key: string]: string[]; // clave: "tabId-rowId", valor: array de squareIds
}

interface SquareValues {
  [key: string]: { // clave: "valor_cuadradoId"
    valor: string;
  };
}

interface LogEntry {
  tabId: string;
  spaces: { [key: string]: string[] }; // "rowId": [squareId1, squareId2, ...]
  squareIds: string[];
}

export default function Home() {
  // Estados para los cuadrados y pestañas
  const [squares, setSquares] = useState<Square[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([{ 
    id: 'default', 
    name: 'Pestaña 1', 
    rows: [] 
  }]);
  const [activeTab, setActiveTab] = useState<string>('default');
  const [occupiedSpaces, setOccupiedSpaces] = useState<OccupiedSpaces>({});
  const [squareValues, setSquareValues] = useState<SquareValues>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Referencias para drag and drop
  const dragItem = useRef<string | null>(null);

  // Generar ID aleatorio de 4 dígitos
  const generateId = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Crear nuevo cuadrado
  const createSquare = () => {
    const newId = generateId();
    const newSquare: Square = {
      id: newId,
      position: { x: 50, y: 50 + squares.length * 60 },
      isUsed: false,
      inputValue: ''
    };
    setSquares([...squares, newSquare]);
  };

  // Actualizar valor del input del cuadrado
  const updateSquareInput = useCallback((squareId: string, value: string) => {
    setSquares(squares.map(square => 
      square.id === squareId ? { ...square, inputValue: value } : square
    ));

    // Actualizar el array de valores
    setSquareValues(prev => {
      const newValues = { ...prev };
      
      // Eliminar todas las entradas anteriores de este cuadrado
      Object.keys(newValues).forEach(key => {
        if (key.endsWith(`_${squareId}`)) {
          delete newValues[key];
        }
      });
      
      // Si el valor no está vacío, crear nueva entrada
      if (value.trim() !== '') {
        const key = `${value}_${squareId}`;
        newValues[key] = { valor: value };
      }
      
      return newValues;
    });
  }, [squares]);

  // Crear nueva pestaña
  const createTab = () => {
    const newId = generateId();
    const newTab: Tab = {
      id: newId,
      name: `Pestaña ${tabs.length + 1}`,
      rows: []
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  // Agregar fila a pestaña activa
  const addRow = (spaces: number) => {
    const newRow: Row = {
      id: generateId(),
      spaces: spaces
    };
    
    setTabs(tabs.map(tab => 
      tab.id === activeTab 
        ? { ...tab, rows: [...tab.rows, newRow] }
        : tab
    ));
  };

  // Eliminar fila
  const deleteRow = (rowId: string) => {
    // Liberar cuadrados ocupados en esta fila
    const squaresToFree: string[] = [];
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (spaceKey.includes(`-${rowId}`)) {
        const squareIds = newOccupiedSpaces[spaceKey];
        squaresToFree.push(...squareIds);
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    // Marcar cuadrados como no usados
    setSquares(squares.map(square => 
      squaresToFree.includes(square.id) ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    
    // Eliminar fila
    setTabs(tabs.map(tab => 
      tab.id === activeTab 
        ? { ...tab, rows: tab.rows.filter(row => row.id !== rowId) }
        : tab
    ));
    
    generateLog(newOccupiedSpaces);
  };

  // Eliminar pestaña
  const deleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tabs.length <= 1) return;
    
    // Liberar todos los cuadrados ocupados en esta pestaña
    const squaresToFree: string[] = [];
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (spaceKey.startsWith(`${tabId}-`)) {
        const squareIds = newOccupiedSpaces[spaceKey];
        squaresToFree.push(...squareIds);
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    setSquares(squares.map(square => 
      squaresToFree.includes(square.id) ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
    
    generateLog(newOccupiedSpaces);
  };

  // Eliminar cuadrado del panel izquierdo
  const deleteSquare = (squareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newOccupiedSpaces = { ...occupiedSpaces };
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      newOccupiedSpaces[spaceKey] = newOccupiedSpaces[spaceKey].filter(id => id !== squareId);
      if (newOccupiedSpaces[spaceKey].length === 0) {
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    setOccupiedSpaces(newOccupiedSpaces);
    setSquares(squares.filter(square => square.id !== squareId));
    
    // Eliminar del array de valores
    setSquareValues(prev => {
      const newValues = { ...prev };
      Object.keys(newValues).forEach(key => {
        if (key.endsWith(`_${squareId}`)) {
          delete newValues[key];
        }
      });
      return newValues;
    });
    
    generateLog(newOccupiedSpaces);
  };

  // Manejar inicio de arrastre
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, squareId: string) => {
    const square = squares.find(s => s.id === squareId);
    if (square?.isUsed) {
      e.preventDefault();
      return;
    }
    
    dragItem.current = squareId;
    e.dataTransfer.setData('text/plain', squareId);
    e.currentTarget.classList.add('opacity-40');
  };

  // Manejar arrastre sobre un elemento
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Manejar fin de arrastre
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  // Manejar soltar en un espacio
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tabId: string, rowId: string, spaceIndex: number) => {
    e.preventDefault();
    const squareId = dragItem.current;
    
    if (!squareId) return;

    const square = squares.find(s => s.id === squareId);
    if (!square || square.isUsed) return;
    
    // Verificar si ya existe un array para esta fila
    const spaceKey = `${tabId}-${rowId}`;
    const currentSpaces = occupiedSpaces[spaceKey] || [];
    
    // Verificar si el espacio ya está ocupado
    if (currentSpaces[spaceIndex]) {
      return;
    }
    
    // Actualizar el array de espacios
    const newSpaces = [...currentSpaces];
    newSpaces[spaceIndex] = squareId;
    
    // Actualizar espacios ocupados y marcar cuadrado como usado
    const newOccupiedSpaces: OccupiedSpaces = {
      ...occupiedSpaces,
      [spaceKey]: newSpaces
    };
    
    setOccupiedSpaces(newOccupiedSpaces);
    setSquares(squares.map(square => 
      square.id === squareId ? { ...square, isUsed: true } : square
    ));
    
    generateLog(newOccupiedSpaces);
    e.currentTarget.classList.remove('opacity-40');
  };

  // Remover cuadrado de un espacio
  const removeSquareFromSpace = (tabId: string, rowId: string, spaceIndex: number) => {
    const spaceKey = `${tabId}-${rowId}`;
    const currentSpaces = occupiedSpaces[spaceKey] || [];
    
    const squareId = currentSpaces[spaceIndex];
    const newSpaces = [...currentSpaces];
    newSpaces[spaceIndex] = ''; // Vaciar el espacio
    
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    // Si todos los espacios están vacíos, eliminar la key
    if (newSpaces.every(space => !space)) {
      delete newOccupiedSpaces[spaceKey];
    } else {
      newOccupiedSpaces[spaceKey] = newSpaces;
    }
    
    setSquares(squares.map(square => 
      square.id === squareId ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    generateLog(newOccupiedSpaces);
  };

  // Generar log con información de espacios ocupados
  const generateLog = (spaces: OccupiedSpaces) => {
    const tabData: { [key: string]: LogEntry } = {};
    
    Object.keys(spaces).forEach(spaceKey => {
      const [tabId, rowId] = spaceKey.split('-');
      const squareIds = spaces[spaceKey].filter(id => id !== '');
      
      if (!tabData[tabId]) {
        tabData[tabId] = {
          tabId: tabId,
          spaces: {},
          squareIds: []
        };
      }
      
      tabData[tabId].spaces[rowId] = squareIds;
      squareIds.forEach(squareId => {
        if (!tabData[tabId].squareIds.includes(squareId)) {
          tabData[tabId].squareIds.push(squareId);
        }
      });
    });
    
    const logArray: LogEntry[] = Object.values(tabData);
    setLogs(logArray);
    console.log('Array acumulativo de espacios:', logArray);
  };

  // Filtrar cuadrados no usados para mostrar en el panel izquierdo
  const availableSquares = squares.filter(square => !square.isUsed);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Cuadrados y Pestañas Interactivas
        </h1>
        
        <div className="flex gap-6 mb-8">
          {/* Panel izquierdo */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Panel Izquierdo</h2>
            <button 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
              onClick={createSquare}
            >
              Crear Cuadrado
            </button>
            
            <div className="relative min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              {availableSquares.map((square, index) => (
                <div
                  key={square.id}
                  className="absolute w-48 h-20 flex flex-col items-center justify-center rounded-lg cursor-move select-none shadow-md transition-all bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm p-2"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, square.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    left: `${square.position.x}px`,
                    top: `${50 + index * 80}px`
                  }}
                >
                  <span className="mb-1">{square.id}</span>
                  <input
                    type="text"
                    value={square.inputValue}
                    onChange={(e) => updateSquareInput(square.id, e.target.value)}
                    placeholder="Escribe algo..."
                    className="w-full px-2 py-1 text-xs text-black rounded border-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
                    onClick={(e) => deleteSquare(square.id, e)}
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
          
          {/* Panel derecho */}
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
            
            <div className="tab-content">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
                >
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
                                const square = squares.find(s => s.id === squareId);
                                
                                return (
                                  <div
                                    key={spaceIndex}
                                    className="flex-1 min-h-[80px] border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white transition-colors hover:bg-gray-100"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, tab.id, row.id, spaceIndex)}
                                  >
                                    {squareId ? (
                                      <div className="bg-blue-100 border border-blue-300 rounded-md px-3 py-2 w-full flex flex-col items-center justify-between">
                                        <span className="font-mono font-bold text-blue-700 mb-1">
                                          {squareId}
                                        </span>
                                        {square?.inputValue && (
                                          <span className="text-xs text-green-600 font-medium">
                                            {square.inputValue}
                                          </span>
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
        </div>
        
        {/* Array de Valores */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Array de Valores de Cuadrados
          </h3>
          <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto text-sm">
            {JSON.stringify(squareValues, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}