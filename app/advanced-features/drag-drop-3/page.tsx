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
  label: string;        
  placeholder: string;  
}

interface Tab {
  id: string;
  name: string;
  rows: Row[];
}

interface Row {
  id: string;
  spaces: number;
}

interface OccupiedSpaces {
  [key: string]: string[];
}

interface FormStructure {
  pagina: string;
  filas: {
    className: string;
    fields: {
      [key: string]: {
        label: string;
        type: string;
        placeholder: string;
        className: string;
        validate?: {
          required?: boolean;
          min4?: boolean;
        };
      };
    };
  }[];
}

interface LogEntry {
  tabId: string;
  spaces: { [key: string]: string[] };
  squareIds: string[];
}

export default function Home() {
  const [squares, setSquares] = useState<Square[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([{ 
    id: 'default', 
    name: 'Pestaña 1', 
    rows: [] 
  }]);
  const [activeTab, setActiveTab] = useState<string>('default');
  const [occupiedSpaces, setOccupiedSpaces] = useState<OccupiedSpaces>({});
  const [formStructure, setFormStructure] = useState<FormStructure[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const dragItem = useRef<string | null>(null);

  const generateId = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const createSquare = () => {
    const newId = generateId();
    const newSquare: Square = {
      id: newId,
      position: { x: 50, y: 50 + squares.length * 60 },
      isUsed: false,
      inputValue: 'text',
      label: '',
      placeholder: ''
    };
    setSquares([...squares, newSquare]);
  };

  const saveToSessionStorage = (data: FormStructure[]) => {
  sessionStorage.setItem('formJsonData', JSON.stringify(data));
};

const generateAndSaveFormJson = () => {
  // Verificar si hay espacios vacíos y si hay al menos un campo
  let hasEmptySpaces = false;
  let hasFields = false;
  
  tabs.forEach(tab => {
    tab.rows.forEach(row => {
      const spaceKey = `${tab.id}-${row.id}`;
      const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
      
      const emptySpaces = rowSpaces.filter(space => !space || space === '').length;
      const filledSpaces = rowSpaces.filter(space => space && space !== '').length;
      
      if (emptySpaces > 0) {
        hasEmptySpaces = true;
        console.log(`❌ Fila en ${tab.name} tiene ${emptySpaces} espacio(s) vacío(s)`);
      }
      
      if (filledSpaces > 0) {
        hasFields = true;
      }
    });
  });
  
  if (hasEmptySpaces) {
    alert('Hay espacios vacíos en algunas filas. Completa todos los espacios antes de generar el JSON.');
    return;
  }
  
  if (!hasFields) {
    alert('No hay filas con campos completos. Agrega cuadrados a los espacios primero.');
    return;
  }
  
  // Generar el JSON actualizado en el momento
  const currentFormStructure: FormStructure[] = [];
  
  tabs.forEach(tab => {
    const pagina = `Página ${tabs.indexOf(tab) + 1}`;
    const filas: any[] = [];
    
    tab.rows.forEach(row => {
      const spaceKey = `${tab.id}-${row.id}`;
      const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
      
      const fields: { [key: string]: any } = {};
      let rowHasFields = false;
      
      rowSpaces.forEach((squareId, index) => {
        if (squareId && squareId !== '') {
          const square = squares.find(s => s.id === squareId);
          if (square) {
            const fieldName = `${square.label.toLowerCase().replace(/\s+/g, '_')}__${squareId}`;
            fields[fieldName] = {
              label: square.label,
              type: square.inputValue,
              placeholder: square.placeholder,
              className: "col-span-1",
              validate: { required: true }
            };
            rowHasFields = true;
          }
        }
      });
      
      if (rowHasFields) {
        let className = "";
        switch(row.spaces) {
          case 1:
            className = "grid grid-cols-1 gap-4";
            break;
          case 2:
            className = "grid grid-cols-2 gap-4";
            break;
          case 3:
            className = "grid grid-cols-3 gap-4";
            break;
        }
        
        filas.push({
          className,
          fields
        });
      }
    });
    
    if (filas.length > 0) {
      currentFormStructure.push({
        pagina,
        filas
      });
    }
  });

  saveToSessionStorage(currentFormStructure);
  
  console.log('🎯 JSON del Formulario:');
  console.log(JSON.stringify(currentFormStructure, null, 2));

  window.location.href = '/advanced-features/drag-drop-3/preview';
};

const updateFormStructure = useCallback(() => {
  const newFormStructure: FormStructure[] = [];
  
  tabs.forEach(tab => {
    const pagina = `Página ${tabs.indexOf(tab) + 1}`;
    const filas: any[] = [];
    
    tab.rows.forEach(row => {
      const spaceKey = `${tab.id}-${row.id}`;
      const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
      
      const fields: { [key: string]: any } = {};
      let hasFields = false;
      
      rowSpaces.forEach((squareId, index) => {
        if (squareId && squareId !== '') {
          const square = squares.find(s => s.id === squareId);
          if (square) {
            const fieldName = `${square.label.toLowerCase().replace(/\s+/g, '_')}__${squareId}`;
            fields[fieldName] = {
              label: square.label,
              type: square.inputValue,
              placeholder: square.placeholder,
              className: "col-span-1",
              validate: { required: true }
            };
            hasFields = true;
          }
        }
      });
      
      if (hasFields) {
        let className = "";
        switch(row.spaces) {
          case 1:
            className = "grid grid-cols-1 gap-4";
            break;
          case 2:
            className = "grid grid-cols-2 gap-4";
            break;
          case 3:
            className = "grid grid-cols-3 gap-4";
            break;
        }
        
        filas.push({
          className,
          fields
        });
      }
    });
    
    if (filas.length > 0) {
      newFormStructure.push({
        pagina,
        filas
      });
    }
  });
  
  setFormStructure(newFormStructure);
}, [tabs, occupiedSpaces, squares]);

const generateFormJson = () => {
  let hasEmptySpaces = false;
  let hasFields = false;
  
  tabs.forEach(tab => {
    tab.rows.forEach(row => {
      const spaceKey = `${tab.id}-${row.id}`;
      const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
      
      const emptySpaces = rowSpaces.filter(space => !space || space === '').length;
      const filledSpaces = rowSpaces.filter(space => space && space !== '').length;
      
      if (emptySpaces > 0) {
        hasEmptySpaces = true;
        console.log(`❌ Fila en ${tab.name} tiene ${emptySpaces} espacio(s) vacío(s)`);
      }
      
      if (filledSpaces > 0) {
        hasFields = true;
      }
    });
  });
  
  if (hasEmptySpaces) {
    alert('Hay espacios vacíos en algunas filas. Completa todos los espacios antes de generar el JSON.');
    return;
  }
  
  if (!hasFields) {
    alert('No hay filas con campos completos. Agrega cuadrados a los espacios primero.');
    return;
  }
  
  // Generar el JSON actualizado en el momento
  const currentFormStructure: FormStructure[] = [];
  
  tabs.forEach(tab => {
    const pagina = `Página ${tabs.indexOf(tab) + 1}`;
    const filas: any[] = [];
    
    tab.rows.forEach(row => {
      const spaceKey = `${tab.id}-${row.id}`;
      const rowSpaces = occupiedSpaces[spaceKey] || Array(row.spaces).fill('');
      
      const fields: { [key: string]: any } = {};
      let rowHasFields = false;
      
      rowSpaces.forEach((squareId, index) => {
        if (squareId && squareId !== '') {
          const square = squares.find(s => s.id === squareId);
          if (square) {
            const fieldName = `${square.label.toLowerCase().replace(/\s+/g, '_')}__${squareId}`;
            fields[fieldName] = {
              label: square.label,
              type: square.inputValue,
              placeholder: square.placeholder,
              className: "col-span-1",
              validate: { required: true }
            };
            rowHasFields = true;
          }
        }
      });
      
      if (rowHasFields) {
        let className = "";
        switch(row.spaces) {
          case 1:
            className = "grid grid-cols-1 gap-4";
            break;
          case 2:
            className = "grid grid-cols-2 gap-4";
            break;
          case 3:
            className = "grid grid-cols-3 gap-4";
            break;
        }
        
        filas.push({
          className,
          fields
        });
      }
    });
    
    if (filas.length > 0) {
      currentFormStructure.push({
        pagina,
        filas
      });
    }
  });
  
  console.log('🎯 JSON del Formulario:');
  console.log(JSON.stringify(currentFormStructure, null, 2));
  
};

  const updateSquareInput = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, inputValue: value } : square
    ));
    updateFormStructure();
  }, [updateFormStructure]);

  const updateSquareLabel = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, label: value } : square
    ));
    updateFormStructure();
  }, [updateFormStructure]);

  const updateSquarePlaceholder = useCallback((squareId: string, value: string) => {
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, placeholder: value } : square
    ));
    updateFormStructure();
  }, [updateFormStructure]);

  const createTab = () => {
    const newId = generateId();
    const newTab: Tab = {
      id: newId,
      name: `Pestaña ${tabs.length + 1}`,
      rows: []
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

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
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

  const deleteRow = (rowId: string) => {
    const squaresToFree: string[] = [];
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (spaceKey.includes(`-${rowId}`)) {
        const squareIds = newOccupiedSpaces[spaceKey];
        squaresToFree.push(...squareIds);
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    setSquares(prev => prev.map(square => 
      squaresToFree.includes(square.id) ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    setTabs(prev => prev.map(tab => 
      tab.id === activeTab 
        ? { ...tab, rows: tab.rows.filter(row => row.id !== rowId) }
        : tab
    ));
    
    generateLog(newOccupiedSpaces);
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

  const deleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tabs.length <= 1) return;
    
    const squaresToFree: string[] = [];
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    Object.keys(newOccupiedSpaces).forEach(spaceKey => {
      if (spaceKey.startsWith(`${tabId}-`)) {
        const squareIds = newOccupiedSpaces[spaceKey];
        squaresToFree.push(...squareIds);
        delete newOccupiedSpaces[spaceKey];
      }
    });
    
    setSquares(prev => prev.map(square => 
      squaresToFree.includes(square.id) ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
    
    generateLog(newOccupiedSpaces);
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

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
    setSquares(prev => prev.filter(square => square.id !== squareId));
    
    generateLog(newOccupiedSpaces);
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tabId: string, rowId: string, spaceIndex: number) => {
    e.preventDefault();
    const squareId = dragItem.current;
    
    if (!squareId) return;

    const square = squares.find(s => s.id === squareId);
    if (!square || square.isUsed) return;
    
    const spaceKey = `${tabId}-${rowId}`;
    const currentSpaces = occupiedSpaces[spaceKey] || [];
    
    if (currentSpaces[spaceIndex]) {
      return;
    }
    
    const newSpaces = [...currentSpaces];
    newSpaces[spaceIndex] = squareId;
    
    const newOccupiedSpaces: OccupiedSpaces = {
      ...occupiedSpaces,
      [spaceKey]: newSpaces
    };
    
    setOccupiedSpaces(newOccupiedSpaces);
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, isUsed: true } : square
    ));
    
    // Actualizar estructura inmediatamente
    setTimeout(() => {
      updateFormStructure();
    }, 0);
    
    generateLog(newOccupiedSpaces);
    e.currentTarget.classList.remove('opacity-40');
  };

  const removeSquareFromSpace = (tabId: string, rowId: string, spaceIndex: number) => {
    const spaceKey = `${tabId}-${rowId}`;
    const currentSpaces = occupiedSpaces[spaceKey] || [];
    
    const squareId = currentSpaces[spaceIndex];
    const newSpaces = [...currentSpaces];
    newSpaces[spaceIndex] = '';
    
    const newOccupiedSpaces = { ...occupiedSpaces };
    
    if (newSpaces.every(space => !space)) {
      delete newOccupiedSpaces[spaceKey];
    } else {
      newOccupiedSpaces[spaceKey] = newSpaces;
    }
    
    setSquares(prev => prev.map(square => 
      square.id === squareId ? { ...square, isUsed: false } : square
    ));
    
    setOccupiedSpaces(newOccupiedSpaces);
    generateLog(newOccupiedSpaces);
    
    // Actualizar estructura inmediatamente
    setTimeout(() => {
      updateFormStructure();
    }, 0);
  };

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

  const availableSquares = squares.filter(square => !square.isUsed);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Cuadrados y Pestañas Interactivas
        </h1>
        
        <div className="flex gap-6 mb-8">
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
                  className="absolute w-48 h-28 flex flex-col items-center justify-center rounded-lg cursor-move select-none shadow-md transition-all bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm p-2"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, square.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    left: `${square.position.x}px`,
                    top: `${50 + index * 100}px`
                  }}
                >
                  <span className="mb-1 text-xs">{square.id}</span>
                  <input
                    type="text"
                    value={square.inputValue}
                    onChange={(e) => updateSquareInput(square.id, e.target.value)}
                    placeholder="Type (text, email, etc)..."
                    className="w-full px-2 py-1 text-xs text-black rounded border-none mb-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={square.label}
                    onChange={(e) => updateSquareLabel(square.id, e.target.value)}
                    placeholder="Label..."
                    className="w-full px-2 py-1 text-xs text-black rounded border-none mb-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={square.placeholder}
                    onChange={(e) => updateSquarePlaceholder(square.id, e.target.value)}
                    placeholder="Placeholder..."
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
                                        <span className="font-mono font-bold text-blue-700 mb-1 text-xs">
                                          {squareId}
                                        </span>
                                        {square && (
                                          <div className="text-xs text-center">
                                            <div className="text-green-600 font-medium">Type: {square.inputValue}</div>
                                            <div className="text-gray-600">Label: {square.label}</div>
                                            <div className="text-gray-500">Placeholder: {square.placeholder}</div>
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
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
  <h3 className="text-lg font-semibold text-gray-700 mb-3">
    Generar JSON del Formulario
  </h3>
  <div className="flex gap-2">
    <button 
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      onClick={() => generateFormJson()}
    >
      Mostrar JSON en Consola
    </button>
    <button 
      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      onClick={() => generateAndSaveFormJson()}
    >
      Ver Preview
    </button>
  </div>
</div>
      </main>
    </div>
  );
}