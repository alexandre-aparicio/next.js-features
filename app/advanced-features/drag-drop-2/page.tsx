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
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  // Calcular zonas ocupadas para la página activa
  const occupiedZones = items
    .filter(item => item.isRectangle && item.dropZoneIndex !== undefined && item.pageId === activePage)
    .map(item => item.dropZoneIndex as number);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/interactjs@1.10.17/dist/interact.min.js";
    script.onload = () => console.log("InteractJS Loaded");
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useInteractJS(items, occupiedZones, containerRef, setItems, setDraggedItemId);

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

  // Función para manejar drop en una zona específica - CORREGIDA
  const handleDropInZone = (zoneIndex: number, draggedItem: DraggableItem | null) => {
    console.log("🔄 handleDropInZone llamado:", { zoneIndex, draggedItemId: draggedItem?.id });
    
    if (occupiedZones.includes(zoneIndex)) {
      console.log("❌ Zona ya ocupada");
      return;
    }

    if (!draggedItem) {
      console.log("❌ No hay item arrastrado");
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === draggedItem.id) {
          console.log("📋 FORMULARIO PEGADO - DragDropPage:", {
            itemId: item.id,
            pageId: activePage,
            zone: zoneIndex,
            fields: item.fields,
            customColor: item.customColor,
            timestamp: new Date().toISOString()
          });

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

    setDraggedItemId(null);
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
    const newPageId = Math.max(...pages.map(p => p.id)) + 1;
    const newPage: FormPage = {
      id: newPageId,
      name: `Página ${newPageId}`,
      items: []
    };
    setPages(prev => [...prev, newPage]);
    setActivePage(newPageId);
  };

  const deletePage = (pageId: number) => {
    setItems(prev => prev.filter(item => item.pageId !== pageId));
    setPages(prev => {
      const newPages = prev.filter(p => p.id !== pageId);
      if (newPages.length === 0) {
        const newPage = { id: 1, name: "Página 1", items: [] };
        setActivePage(1);
        return [newPage];
      }
      if (activePage === pageId) {
        setActivePage(newPages[0].id);
      }
      return newPages;
    });
  };

  // Cambiar página activa
  const handlePageChange = (pageId: number) => {
    setActivePage(pageId);
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
          >
            + Nueva Página
          </button>
        </div>
        <span className="text-gray-600 text-sm">
          {items.length} elemento(s) | {occupiedZones.length}/1 espacio ocupado | Página {activePage}
          {draggedItemId && " | 🎯 Arrastrando elemento"}
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
            } relative`}
          >
            {page.name}
            <span
              onClick={(e) => {
                e.stopPropagation();
                deletePage(page.id);
              }}
              className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center cursor-pointer"
            >
              ✕
            </span>
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
          draggedItemId={draggedItemId}
          items={items}
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