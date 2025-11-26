// app/advanced-features/drag-drop/LayoutHeader.tsx
interface LayoutHeaderProps {
  onAddLayout: () => void;
}

export const LayoutHeader = ({ onAddLayout }: LayoutHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Layouts</h2>
      <button
        onClick={onAddLayout}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        + Añadir Layout
      </button>
    </div>
  );
};