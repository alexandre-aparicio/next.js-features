"use client";

interface SearchBoxProps {
  busqueda: string;
  onBusquedaChange: (busqueda: string) => void;
  placeholder?: string;
}

export default function SearchBox({ 
  busqueda, 
  onBusquedaChange, 
  placeholder = "Buscar..." 
}: SearchBoxProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-60 bg-gray-50"
      />
    </div>
  );
}