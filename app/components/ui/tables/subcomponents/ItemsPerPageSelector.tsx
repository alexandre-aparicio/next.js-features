"use client";

interface ItemsPerPageSelectorProps {
  itemsPorPagina: number;
  onItemsPorPaginaChange: (items: number) => void;  // ← nombre corregido
  options?: number[];
}

export default function ItemsPerPageSelector({
  itemsPorPagina,
  onItemsPorPaginaChange,
  options = [10, 20, 50]
}: ItemsPerPageSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-600">Mostrar:</span>
      <select
        value={itemsPorPagina}
        onChange={(e) => onItemsPorPaginaChange(Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
