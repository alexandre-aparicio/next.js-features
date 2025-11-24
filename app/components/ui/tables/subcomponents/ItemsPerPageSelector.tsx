"use client";

interface ItemsPerPageSelectorProps {
  itemsPorPagina: number;
  onItemsPorPaginaChange: (items: number) => void;
  options?: number[];
}

export default function ItemsPerPageSelector({
  itemsPorPagina,
  onItemsPorPaginaChange,
  options = [10, 20, 50]
}: ItemsPerPageSelectorProps) {
  return (
    <div className="flex items-center">
      <span>Mostrar:</span>
      <select
        value={itemsPorPagina}
        onChange={(e) => onItemsPorPaginaChange(Number(e.target.value))}
        className="border px-2 py-1"
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