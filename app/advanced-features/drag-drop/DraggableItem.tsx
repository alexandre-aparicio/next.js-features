import { DraggableItem as DraggableItemType } from "./types";
import { getColorById } from "./utils";

interface DraggableItemProps {
  item: DraggableItemType;
  setItemRef: (element: HTMLDivElement | null, item: DraggableItemType) => void;
  setItems: React.Dispatch<React.SetStateAction<DraggableItemType[]>>;
}

export const DraggableItem = ({ item, setItemRef, setItems }: DraggableItemProps) => {
  // Función para obtener el color actual (personalizado o por ID)
  const getCurrentColor = () => {
    return item.customColor || getColorById(item.id);
  };

  return (
    <div
      ref={(el) => setItemRef(el, item)}
      className={`cursor-move absolute select-none p-2 ${
        item.isRectangle ? "w-40 h-auto rounded-lg" : "w-48 h-30 rounded-lg"
      }`}
      style={{
        touchAction: "none",
        userSelect: "none",
        transition: "all 0.2s",
        transform: `translate(${item.x}px, ${item.y}px)`,
        backgroundColor: getCurrentColor(), // ← Usar la función para obtener el color
      }}
    >
      {!item.isRectangle ? (
        <ItemFields item={item} setItems={setItems} getCurrentColor={getCurrentColor} />
      ) : (
        <div className="text-white font-bold text-sm">
          {item.fields.label
            ? item.fields.label.toLowerCase().replaceAll(" ", "")
            : "sinlabel"}
        </div>
      )}
    </div>
  );
};

const ItemFields = ({ item, setItems, getCurrentColor }: { item: DraggableItemType; setItems: any; getCurrentColor: () => string }) => {
  // Array de colores disponibles
  const availableColors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];

  // Función para cambiar el color del item
  const handleColorChange = (color: string) => {
    setItems((prev: DraggableItemType[]) =>
      prev.map((i) =>
        i.id === item.id
          ? { 
              ...i, 
              customColor: color // Almacenar el color seleccionado
            }
          : i
      )
    );
  };

  const currentColor = getCurrentColor();

  return (
    <div className="flex flex-col gap-2 text-xs">
      {/* Selector de colores */}
      <div className="flex gap-1 justify-center mb-2">
        {availableColors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorChange(color)}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              currentColor === color 
                ? 'border-white scale-110 shadow-md' 
                : 'border-gray-300 hover:scale-105 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            title={`Seleccionar color ${color}`}
          />
        ))}
      </div>

      {/* Campos del formulario */}
      <input
        type="text"
        placeholder="Label"
        className="p-1 rounded bg-white border border-gray-300 focus:border-blue-500 focus:outline-none"
        value={item.fields.label}
        onChange={(e) => updateField(item, "label", e.target.value, setItems)}
      />
      <input
        type="text"
        placeholder="Placeholder"
        className="p-1 rounded bg-white border border-gray-300 focus:border-blue-500 focus:outline-none"
        value={item.fields.placeholder}
        onChange={(e) => updateField(item, "placeholder", e.target.value, setItems)}
      />
      <select
        className="p-1 rounded bg-white border border-gray-300 focus:border-blue-500 focus:outline-none"
        value={item.fields.type}
        onChange={(e) => updateField(item, "type", e.target.value, setItems)}
      >
        <option value="text">Texto</option>
        <option value="number">Número</option>
        <option value="select">Select</option>
      </select>
    </div>
  );
};

const updateField = (item: DraggableItemType, field: keyof typeof item.fields, value: string, setItems: any) => {
  setItems((prev: DraggableItemType[]) =>
    prev.map((i) =>
      i.id === item.id
        ? { ...i, fields: { ...i.fields, [field]: value } }
        : i
    )
  );
};