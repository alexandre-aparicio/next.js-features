"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FormTemplate } from '@/app/components/ui/forms/FormTemplate';
import { FormRow } from '@/app/components/ui/forms/FormTemplate';
import { LayoutFieldGroup } from '../types';

export default function Preview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No hay datos</h1>
          <p className="text-gray-600">Vuelve al editor y crea un formulario primero.</p>
        </div>
      </div>
    );
  }

  try {
    const formStructure: LayoutFieldGroup[] = JSON.parse(decodeURIComponent(data));

    const formRows: FormRow[] = formStructure.map((layoutGroup) => ({
    className: layoutGroup.className,
    fields: Object.entries(layoutGroup.fields).reduce((acc, [fieldKey, fieldConfig]) => {
       
        const isSingleColumn = layoutGroup.className.includes('grid-cols-1');
        
        acc[fieldKey] = {
        label: fieldConfig.label,
        type: fieldConfig.type,
        placeholder: fieldConfig.placeholder,
        validate: { required: true },
        className: isSingleColumn ? "w-full" : fieldConfig.className // ← Usar w-full para 1 columna
        };
        return acc;
    }, {} as Record<string, any>)
    }));

    const handleSubmit = (formData: Record<string, string>) => {
      console.log('Datos del formulario generado:', formData);
      alert('Formulario enviado correctamente!');
    };

    const handleBack = () => {
      router.back();
    };

    return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Formulario Generado</h1>
          <p className="text-gray-600 mt-2">
            {formRows.length} layout(s) • {formRows.reduce((total, row) => total + Object.keys(row.fields).length, 0)} campo(s)
          </p>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Volver al Editor
        </button>
      </div>

      {/* Formulario con estilos personalizados */}
      <div className="custom-form-styles">
        <FormTemplate
          formRows={formRows}
          onSubmit={handleSubmit}
          submitText="Enviar Formulario"
          className="space-y-6"
        />
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .custom-form-styles :global(input),
        .custom-form-styles :global(select),
        .custom-form-styles :global(textarea) {
          width: 100% !important;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-sizing: border-box;
        }
        .custom-form-styles :global(input:focus),
        .custom-form-styles :global(select:focus),
        .custom-form-styles :global(textarea:focus) {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  </div>
);

  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">Los datos del formulario son inválidos.</p>
        </div>
      </div>
    );
  }
}