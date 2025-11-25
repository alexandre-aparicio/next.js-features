"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DraggableItem, GridLayout, LayoutFieldGroup } from "./types";
import { useInteractJS } from "./useInteractJS";
import { getAllFieldsFromDropZones } from "./utils";
import { DraggableItem as DraggableItemComponent } from "./DraggableItem";
import { RightPanel } from "./RightPanel";

const DragDropPage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [layouts, setLayouts] = useState<GridLayout[]>([]);
  const [nextId, setNextId] = useState(1);
  const [formStructure, setFormStructure] = useState<LayoutFieldGroup[]>([]);

  // Calcular zonas ocupadas directamente desde los items
  const occupiedZones = items
    .filter(item => item.isRectangle && item.dropZoneIndex !== undefined)
    .map(item => item.dropZoneIndex as number);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/interactjs@1.10.17/dist/interact.min.js";
    script.onload = () => console.log("InteractJS Loaded");
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const layoutFieldGroups = getAllFieldsFromDropZones(items, layouts);
    setFormStructure(layoutFieldGroups);
    
    console.log("=== ESTRUCTURA DE FORMULARIO ===");
    console.log("Total layouts con campos:", layoutFieldGroups.length);
  }, [items, layouts]);

  useInteractJS(items, occupiedZones, containerRef, setItems, layouts);

  const createNewItem = () => {
    const newItem: DraggableItem = {
      id: nextId,
      x: 20 + items.length * 10,
      y: 20 + items.length * 10,
      isRectangle: false,
      ref: { current: null },
      fields: { label: "", placeholder: "", type: "text" },
    };
    setItems((prev) => [...prev, newItem]);
    setNextId((prev) => prev + 1);
  };

  const setItemRef = (element: HTMLDivElement | null, item: DraggableItem) => {
    if (element) item.ref.current = element;
  };

  const getTotalDropZones = () => {
    return layouts.reduce((total, layout) => total + (layout.columns * layout.rows), 0);
  };

  const handleNext = () => {
    // Navegar a la página de preview pasando los datos como query params
    const data = encodeURIComponent(JSON.stringify(formStructure));
    router.push(`/advanced-features/drag-drop/preview?data=${data}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 select-none">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <button
            onClick={createNewItem}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
          >
            + Crear Nuevo Elemento
          </button>
          <span className="ml-3 text-gray-600 text-sm">
            {items.length} elemento(s) | {occupiedZones.length}/{getTotalDropZones()} zonas ocupadas
          </span>
        </div>
        
        {/* BOTÓN SIGUIENTE */}
        <button
          onClick={handleNext}
          disabled={formStructure.length === 0}
          className={`px-6 py-2 rounded-lg shadow transition-colors flex items-center gap-2 ${
            formStructure.length === 0
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Siguiente →
        </button>
      </div>

      <div ref={containerRef} className="h-[calc(100vh-100px)] flex gap-4 relative select-none">
        <div className="left-panel flex-1 bg-white rounded-lg border-2 border-gray-300"></div>
        <RightPanel 
          layouts={layouts} 
          setLayouts={setLayouts} 
          occupiedZones={occupiedZones} 
          setItems={setItems}
        />
        {items.map((item) => (
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