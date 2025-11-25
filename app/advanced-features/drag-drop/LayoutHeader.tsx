// app/advanced-features/drag-drop/LayoutHeader.tsx
interface LayoutHeaderProps {
  onAddLayout: (columns: number) => void;
}

export const LayoutHeader = ({ onAddLayout }: LayoutHeaderProps) => {
  return (
    <div className="flex gap-2 mb-4">
      {[1, 2, 3].map(cols => (
        <button
          key={cols}
          onClick={() => onAddLayout(cols)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow text-sm transition-colors"
        >
          {cols} Columna{cols > 1 ? "s" : ""}
        </button>
      ))}
    </div>
  );
};