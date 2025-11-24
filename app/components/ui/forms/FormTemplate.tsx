"use client";

import { useState } from 'react';
import Input from './Input';
import { validateField, ValidationConfig } from './Validation';

interface FieldConfig {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder: string;
  validate: ValidationConfig;
  className?: string;
}

interface FormRow {
  fields: Record<string, FieldConfig>;
  className?: string;
}

interface FormTemplateProps {
  formRows: FormRow[];
  onSubmit: (formData: Record<string, string>) => void;
  submitText?: string;
  className?: string;
}

export const FormTemplate: React.FC<FormTemplateProps> = ({
  formRows,
  onSubmit,
  submitText = "Enviar",
  className = ""
}) => {
  // Crear un objeto plano con todos los campos
  const allFieldsConfig: Record<string, FieldConfig> = {};
  
  formRows.forEach(row => {
    Object.entries(row.fields).forEach(([fieldName, fieldConfig]) => {
      allFieldsConfig[fieldName] = fieldConfig;
    });
  });

  const allFieldNames = Object.keys(allFieldsConfig);
  
  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(allFieldNames.map(key => [key, '']))
  );
  
  const [errors, setErrors] = useState<Record<string, string>>(
    Object.fromEntries(allFieldNames.map(key => [key, '']))
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(allFieldsConfig).forEach(([fieldName, fieldConfig]) => {
      const error = validateField(formData[fieldName], fieldConfig.validate);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {formRows.map((row, rowIndex) => (
        <div key={rowIndex} className={row.className || "flex gap-4 mb-4"}>
          {Object.entries(row.fields).map(([fieldName, fieldConfig]) => (
            <Input
              key={fieldName}
              name={fieldName}
              label={fieldConfig.label}
              type={fieldConfig.type}
              value={formData[fieldName]}
              onChange={handleChange}
              validate={fieldConfig.validate}
              error={errors[fieldName]}
              placeholder={fieldConfig.placeholder}
              className={fieldConfig.className || "flex-1"}
            />
          ))}
        </div>
      ))}

      <button 
        type="submit" 
        className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        {submitText}
      </button>
    </form>
  );
};

export type { FieldConfig, FormRow };
