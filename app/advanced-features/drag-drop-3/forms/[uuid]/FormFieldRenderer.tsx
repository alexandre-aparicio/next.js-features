// components/FormFieldRenderer.tsx

import React from 'react';

interface SquareOption {
  id: string;
  value: string;
  label: string;
}

interface FormField {
  label: string;
  type: string;
  placeholder: string;
  className: string;
  options?: SquareOption[];
  selectType?: 'single' | 'multiple';  // ← CAMBIADO: de 'multiple?: boolean' a 'selectType?'
  validate?: {
    required?: boolean;
    min4?: boolean;
  };
}

interface FormFieldRendererProps {
  fieldName: string;
  fieldConfig: FormField;
  value: string | string[]; // string for single, string[] for multiple
  onChange: (fieldName: string, value: string | string[]) => void;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  fieldName,
  fieldConfig,
  value,
  onChange,
}) => {
  const options = fieldConfig.options || [];
  
  // ← CAMBIADO: Usar selectType en lugar de multiple
  const isMultiple = fieldConfig.selectType === 'multiple';
  const isSingle = fieldConfig.selectType === 'single';

  // Para checkboxes
  const selectedValues: string[] = Array.isArray(value) ? value : [];

  const toggleCheckbox = (val: string) => {
    const current = Array.isArray(value) ? value : [];

    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];

    onChange(fieldName, updated);
  };

  /** CHECKBOXES (multiple) */
  const renderMultipleCheckboxes = () => (
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => (
        <label
          key={option.id || index}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={() => toggleCheckbox(option.value)}
            className="accent-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-700 text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );

  /** RADIOS (simple ≤4) */
  const renderRadios = () => (
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => (
        <label
          key={option.id || index}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name={fieldName}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className="accent-blue-500 focus:ring-blue-500"
            required={fieldConfig.validate?.required}
          />
          <span className="text-gray-700 text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );

  /** SELECT (simple >4) */
  const renderSelect = () => (
    <select
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(fieldName, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={fieldConfig.validate?.required}
    >
      <option value="">Selecciona una opción</option>
      {options.map((option, index) => (
        <option
          key={option.id || index}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );

  /** SELECCIÓN AUTOMÁTICA - Réplica del comportamiento del preview */
  const renderSelectionField = () => {
    // ← CAMBIADO: Usar selectType para la lógica
    if (isMultiple) {
      return renderMultipleCheckboxes();
    }
    
    // Si es simple y tiene más de 4 opciones → select dropdown
    if (isSingle && options.length > 4) {
      return renderSelect();
    }
    
    // Si es simple y tiene 4 o menos opciones → radios
    return renderRadios();
  };

  /** INPUT / TEXTAREA / SELECT */
  const renderField = () => {
    if (fieldConfig.type === "textarea") {
      return (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={fieldConfig.placeholder}
          required={fieldConfig.validate?.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent resize-vertical min-h-[100px]"
        />
      );
    }

    // Campo select con opciones
    if (fieldConfig.type === "select" && options.length > 0) {
      return renderSelectionField();
    }

    // Input normal (text, email, number, etc.)
    return (
      <input
        type={fieldConfig.type}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(fieldName, e.target.value)}
        placeholder={fieldConfig.placeholder}
        required={fieldConfig.validate?.required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:border-transparent"
      />
    );
  };

  return (
    <div className={fieldConfig.className}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        {/* LABEL */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {fieldConfig.label}
            {fieldConfig.validate?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>

          {renderField()}
        </div>

        {/* METADATA - ACTUALIZADO para mostrar selectType */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <div>
            <strong>Nombre del campo:</strong> {fieldName}
          </div>
          <div>
            <strong>Tipo:</strong> {fieldConfig.type}
          </div>
          <div>
            <strong>Select Type:</strong> {fieldConfig.selectType || 'no definido'}
          </div>

          {options.length > 0 && (
            <div className="mt-1">
              <strong>Opciones:</strong> {options.length}

              {/* Indicadores del tipo de selección - ACTUALIZADO */}
              {isMultiple && (
                <span className="text-purple-600 ml-1">(checkboxes múltiples)</span>
              )}

              {isSingle && options.length <= 4 && (
                <span className="text-green-600 ml-1">(radio buttons)</span>
              )}

              {isSingle && options.length > 4 && (
                <span className="text-blue-600 ml-1">(dropdown select)</span>
              )}

              {/* Mostrar opciones disponibles */}
              <div className="flex flex-wrap gap-1 mt-1">
                {options.map((option, index) => (
                  <span
                    key={option.id || index}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fieldConfig.validate?.required && (
            <div className="text-green-600 font-medium mt-1">
              Campo obligatorio
            </div>
          )}

          {fieldConfig.validate?.min4 && (
            <div className="text-orange-600 font-medium mt-1">
              Mínimo 4 caracteres
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormFieldRenderer;