"use client";

import { useEffect, useRef, useState } from "react";
import { DraggableItem, FormPage } from "./types";
import { useInteractJS } from "./useInteractJS";
import { DraggableItem as DraggableItemComponent } from "./DraggableItem";
import { RightPanel } from "./RightPanel";

const DragDropPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [pages, setPages] = useState<FormPage[]>([
    { id: 1, name: "Página 1", items: [] }
  ]);
  const [activePage, setActivePage] = useState<number>(1);

  // Calcular zonas ocupadas para la página activa
  const occupiedZones = items
    .filter(item => item.isRectangle && item.dropZoneIndex !== undefined && item.pageId === activePage)
    .map(item => item.dropZoneIndex as number);

  // Verificar si hay elementos sin colocar en el panel izquierdo para la página activa
  const hasUnplacedItems = items.some(item => 
    !item.isRectangle && item.pageId === activePage
  );

  // Verificar si el espacio derecho está completamente ocupado
  const isRightPanelFull = occupiedZones.length === 1; // Ya que solo hay 1 espacio

  // Determinar si se puede crear nueva página
  const canCreateNewPage = !hasUnplacedItems && isRightPanelFull;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/interactjs@1.10.17/dist/interact.min.js";
    script.onload = () => console.log("InteractJS Loaded");
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useInteractJS(items, occupiedZones, containerRef, setItems);

  const createNewItem = () => {
    const newItem: DraggableItem = {
      id: nextId,
      x: 20 + items.length * 10,
      y: 20 + items.length * 10,
      isRectangle: false,
      ref: { current: null },
      fields: { label: "", placeholder: "", type: "text" },
      pageId: activePage
    };
    setItems((prev) => [...prev, newItem]);
    setNextId((prev) => prev + 1);
  };

  const setItemRef = (element: HTMLDivElement | null, item: DraggableItem) => {
    if (element) item.ref.current = element;
  };

  // Función para manejar drop en una zona específica
  const handleDropInZone = (zoneIndex: number) => {
    if (occupiedZones.includes(zoneIndex)) {
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => {
        if (item.isRectangle && item.dropZoneIndex === undefined && item.pageId === activePage) {
          return {
            ...item,
            isRectangle: true,
            dropZoneIndex: zoneIndex,
            x: 0,
            y: 0,
            pageId: activePage
          };
        }
        return item;
      })
    );
  };

  // Función para liberar un item de su zona
  const handleRemoveFromZone = (zoneIndex: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.dropZoneIndex === zoneIndex && item.pageId === activePage
          ? { 
              ...item, 
              isRectangle: false, 
              dropZoneIndex: undefined,
              x: 50 + Math.random() * 200,
              y: 50 + Math.random() * 200
            } 
          : item
      )
    );
  };

  // Añadir nueva página
  const addNewPage = () => {
    if (!canCreateNewPage) return;
    
    const newPageId = Math.max(...pages.map(p => p.id)) + 1;
    const newPage: FormPage = {
      id: newPageId,
      name: `Página ${newPageId}`,
      items: []
    };
    setPages(prev => [...prev, newPage]);
    setActivePage(newPageId);
  };

  // Cambiar página activa
  const handlePageChange = (pageId: number) => {
    setActivePage(pageId);
  };

  // Obtener mensaje de estado para el botón
  const getNewPageButtonStatus = () => {
    if (hasUnplacedItems) return "Hay elementos sin colocar en el panel izquierdo";
    if (!isRightPanelFull) return "El espacio derecho no está completamente ocupado";
    return "Crear nueva página";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 select-none">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={createNewItem}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
          >
            + Crear Nuevo Elemento
          </button>
          <button
            onClick={addNewPage}
            disabled={!canCreateNewPage}
            className={`px-4 py-2 rounded-lg shadow transition-colors ${
              canCreateNewPage
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
            title={getNewPageButtonStatus()}
          >
            + Nueva Página
          </button>
        </div>
        <span className="text-gray-600 text-sm">
          {items.length} elemento(s) | {occupiedZones.length}/1 espacio ocupado | Página {activePage}
          {hasUnplacedItems && " | ⚠️ Elementos sin colocar"}
          {!isRightPanelFull && " | ⚠️ Espacio derecho incompleto"}
        </span>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200 mb-4">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageChange(page.id)}
            className={`px-4 py-2 border-b-2 ${
              activePage === page.id
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {page.name}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="h-[calc(100vh-180px)] flex gap-4 relative select-none">
        <div className="left-panel flex-1 bg-white rounded-lg border-2 border-gray-300"></div>
        
        <RightPanel 
          occupiedZones={occupiedZones} 
          onDrop={handleDropInZone}
          onRemoveFromZone={handleRemoveFromZone}
          activePage={activePage}
        />
        
        {items
          .filter(item => item.pageId === activePage)
          .map((item) => (
            <DraggableItemComponent
              key={item.id}
              item={item}
              setItemRef={setItemRef}
              setItems={setItems}
            />
          ))}
      </div>
    </div>
  );
};

export default DragDropPage;