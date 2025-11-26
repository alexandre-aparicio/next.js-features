// app/page.tsx
'use client';

import { useState, useRef } from 'react';

// Definición de tipos TypeScript
interface Position {
  x: number;
  y: number;
}

interface Square {
  id: string;
  position: Position;
  isUsed: boolean;
}

interface Tab {
  id: string;
  name: string;
}

interface OccupiedSpaces {
  [key: string]: string;
}

interface LogEntry {
  tabId: string;
  spaces: { [key: string]: string };
  squareIds: string[];
}

export default function Home() {
  // Estados para los cuadrados y pestañas
  const [squares, setSquares] = useState<Square[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'default', name: 'Pestaña 1' }]);
  const [activeTab, setActiveTab] = useState<string>('default');
  const [occupiedSpaces, setOccupiedSpaces] = useState<OccupiedSpaces>({});
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
      isUsed: false
    };
    setSquares([...squares, newSquare]);
  };

  // Crear nueva pestaña
  const createTab = () => {
    const newId = generateId();
    const newTab: Tab = {
      id: newId,
      name: `Pestaña ${tabs.length + 1}`
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  // Eliminar pestaña
  const deleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tabs.length <= 1) return; // Siempre debe haber al menos una pestaña
    
    // Liberar todos los cuadrados ocupados en esta pestaña
    const squaresToFree: string[] = [];
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (spaceKey.startsWith(`${tabId}-`)) {
        squaresToFree.push(newOccupiedSpaces[spaceKey]);
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    // Marcar cuadrados como no usados
    setSquares(squares.map(square => 
      squaresToFree.includes(square.id) ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    
    // Eliminar pestaña
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // Si la pestaña activa fue eliminada, activar la primera disponible
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
    
    generateLog(newOccupiedSpaces);
  };

  // Eliminar cuadrado del panel izquierdo
  const deleteSquare = (squareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Liberar espacios ocupados por este cuadrado
    const newOccupiedSpaces = { ...occupiedSpaces };
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (newOccupiedSpaces[spaceKey] === squareId) {
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    setOccupiedSpaces(newOccupiedSpaces);
    setSquares(squares.filter(square => square.id !== squareId));
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
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tabId: string, slotIndex: number) => {
    e.preventDefault();
    const squareId = dragItem.current;
    
    if (!squareId) return;

    const square = squares.find(s => s.id === squareId);
    if (!square || square.isUsed) return;
    
    // Verificar si el espacio ya está ocupado
    const spaceKey = `${tabId}-${slotIndex}`;
    if (occupiedSpaces[spaceKey]) {
      return;
    }
    
    // Actualizar espacios ocupados y marcar cuadrado como usado
    const newOccupiedSpaces: OccupiedSpaces = {
      ...occupiedSpaces,
      [spaceKey]: squareId
    };
    
    setOccupiedSpaces(newOccupiedSpaces);
    setSquares(squares.map(square => 
      square.id === squareId ? { ...square, isUsed: true } : square
    ));
    
    generateLog(newOccupiedSpaces);
    e.currentTarget.classList.remove('opacity-40');
  };

  // Remover cuadrado de un espacio
  const removeSquareFromSpace = (tabId: string, slotIndex: number) => {
    const spaceKey = `${tabId}-${slotIndex}`;
    const squareId = occupiedSpaces[spaceKey];
    
    const newOccupiedSpaces = { ...occupiedSpaces };
    delete newOccupiedSpaces[spaceKey];
    
    // Marcar cuadrado como no usado
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
      const [tabId, slotIndex] = spaceKey.split('-');
      const squareId = spaces[spaceKey];
      
      if (!tabData[tabId]) {
        tabData[tabId] = {
          tabId: tabId,
          spaces: {},
          squareIds: []
        };
      }
      
      tabData[tabId].spaces[slotIndex] = squareId;
      if (!tabData[tabId].squareIds.includes(squareId)) {
        tabData[tabId].squareIds.push(squareId);
      }
    });
    
    const logArray: LogEntry[] = Object.values(tabData);
    setLogs(logArray);
    console.log('Array acumulativo:', logArray);
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
                  className="absolute w-12 h-12 flex items-center justify-center rounded-lg cursor-move select-none shadow-md transition-all bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, square.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    left: `${square.position.x}px`,
                    top: `${50 + index * 60}px`
                  }}
                >
                  {square.id}
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
            <button 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
              onClick={createTab}
            >
              Crear Pestaña
            </button>
            
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
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((slotIndex) => {
                      const spaceKey = `${tab.id}-${slotIndex}`;
                      const squareId = occupiedSpaces[spaceKey];
                      
                      return (
                        <div
                          key={slotIndex}
                          className="min-h-[80px] border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, tab.id, slotIndex)}
                        >
                          {squareId ? (
                            <div className="bg-blue-100 border border-blue-300 rounded-md px-3 py-2 w-full flex items-center justify-between">
                              <span className="font-mono font-bold text-blue-700">
                                {squareId}
                              </span>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center transition-colors"
                                onClick={() => removeSquareFromSpace(tab.id, slotIndex)}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium">
                              Espacio {slotIndex + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Logs (consola también)
          </h3>
          <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto text-sm">
            {JSON.stringify(logs, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}