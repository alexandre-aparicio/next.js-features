interface DropZonePanelProps {
  occupiedZones: number[];
}

export const DropZonePanel = ({ occupiedZones }: DropZonePanelProps) => {
  return (
    <div className="flex-1 bg-white rounded-lg border-2 border-gray-300 p-2">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
        {[0, 1, 2, 3].map((index) => (
          <div 
            key={index}
            className={`drop-zone border-2 border-dashed rounded ${
              occupiedZones.includes(index) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300'
            }`}
          >
            {occupiedZones.includes(index) && (
              <div className="text-green-600 text-xs text-center mt-1">
                Ocupado
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};