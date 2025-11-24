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
    <div className="flex items-center border px-2">
      <i className="fas fa-search text-gray-400"></i>
      <input
        type="text"
        placeholder={placeholder}
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        className="px-2 py-1 border-none focus:outline-none"
      />
    </div>
  );
}