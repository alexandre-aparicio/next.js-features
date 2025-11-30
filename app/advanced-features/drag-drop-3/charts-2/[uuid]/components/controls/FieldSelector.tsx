interface FieldSelectorProps {
  fields: string[];
  selectedField: string | null;
  onFieldSelect: (field: string) => void;
  formatFieldName: (field: string) => string;
}

export default function FieldSelector({
  fields,
  selectedField,
  onFieldSelect,
  formatFieldName
}: FieldSelectorProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Campos</h2>
      <div className="flex gap-1 flex-wrap overflow-y-auto max-h-20">
        {fields.map((field) => (
          <button
            key={field}
            onClick={() => onFieldSelect(field)}
            className={`px-2 py-1 rounded border text-xs transition-all duration-200 ${
              selectedField === field
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {formatFieldName(field)}
          </button>
        ))}
      </div>
    </div>
  );
}