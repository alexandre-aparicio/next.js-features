interface RightPanelProps {
  occupiedZones: number[];
  onDrop: (zoneIndex: number, draggedItem: any) => void;
  onRemoveFromZone: (zoneIndex: number) => void;
  activePage: number;
  draggedItemId: number | null;
  items: any[];
}

export const RightPanel = ({ 
  occupiedZones, 
  onDrop,
  activePage,
  draggedItemId,
  items
}: RightPanelProps) => {
  const zoneIndex = 0;
  const isOccupied = occupiedZones.includes(zoneIndex);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    console.log("🎯 Drop detectado en RightPanel");
    
    // Encontrar el item que se está arrastrando
    const draggedItem = items.find(item => item.id === draggedItemId);
    
    console.log("🔍 Buscando item arrastrado:", {
      draggedItemId,
      draggedItem,
      totalItems: items.length
    });

    if (draggedItem) {
      console.log("📋 FORMULARIO PEGADO - RightPanel:", {
        itemId: draggedItem.id,
        pageId: activePage,
        zoneIndex: zoneIndex,
        fields: draggedItem.fields,
        customColor: draggedItem.customColor,
        timestamp: new Date().toISOString(),
        data: draggedItem
      });
    } else {
      console.log("❌ No se encontró el item arrastrado con ID:", draggedItemId);
    }
    
    onDrop(zoneIndex, draggedItem);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 bg-white rounded-lg border-2 border-gray-300 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Área de Trabajo - Página {activePage}</h2>
        <div className="text-sm text-gray-600">
          {occupiedZones.length}/1 espacio ocupado
          {draggedItemId && " | 🎯 Elemento listo para soltar"}
        </div>
      </div>

      <div 
        className="drop-zone w-full h-96 border-2 rounded-lg flex items-center justify-center transition-colors"
        data-zone-index={zoneIndex}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isOccupied ? (
          <div className="text-center">
            <div className="text-blue-500 text-6xl mb-2">✓</div>
            <p className="text-blue-500 font-semibold">Espacio Ocupado</p>
            <p className="text-gray-500 text-sm mt-1">Página {activePage}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-2">+</div>
            <p className="text-gray-500 font-semibold">Espacio Libre</p>
            <p className="text-gray-400 text-sm mt-1">Arrastra y suelta elementos aquí</p>
            <p className="text-gray-400 text-xs mt-1">Página {activePage}</p>
            {draggedItemId && (
              <p className="text-green-500 text-xs mt-2">✅ Elemento listo para soltar</p>
            )}
          </div>
        )}
      </div>
    </div>
  ); 
};