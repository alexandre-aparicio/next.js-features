// app/advanced-features/drag-drop/PreviewPage.tsx
"use client";

import { useRouter } from "next/navigation";
import { LayoutFieldGroup } from "./types";

interface PreviewPageProps {
  formStructure: LayoutFieldGroup[];
}

export const PreviewPage = ({ formStructure }: PreviewPageProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Volver a la página anterior
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Vista Previa del Formulario</h1>
            <button
              onClick={handleBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              ← Volver al Editor
            </button>
          </div>

          {/* Estadísticas */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Resumen del Formulario
            </h2>
            <div className="grid grid-cols-3 gap-4 text-green-700">
              <div>
                <p className="font-medium">Layouts:</p>
                <p className="text-2xl font-bold">{formStructure.length}</p>
              </div>
              <div>
                <p className="font-medium">Campos totales:</p>
                <p className="text-2xl font-bold">
                  {formStructure.reduce((total, group) => total + Object.keys(group.fields).length, 0)}
                </p>
              </div>
              <div>
                <p className="font-medium">Estructura:</p>
                <p className="text-sm">Lista para usar</p>
              </div>
            </div>
          </div>

          {/* JSON Display */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Estructura JSON Generada</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <pre className="text-green-400 p-6 overflow-x-auto text-sm leading-relaxed">
                {JSON.stringify(formStructure, null, 2)}
              </pre>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(formStructure, null, 2));
                alert("✅ JSON copiado al portapapeles!");
              }}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              📋 Copiar JSON al Portapapeles
            </button>
          </div>

          {/* Vista previa visual */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Vista Previa Visual</h3>
            <div className="space-y-6">
              {formStructure.map((layoutGroup, layoutIndex) => (
                <div key={layoutIndex} className="border-2 border-gray-300 rounded-lg p-6 bg-white">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Layout {layoutIndex + 1}
                    </h4>
                    <code className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                      {layoutGroup.className}
                    </code>
                  </div>
                  
                  <div className={layoutGroup.className}>
                    {Object.entries(layoutGroup.fields).map(([fieldKey, fieldConfig]) => (
                      <div key={fieldKey} className={fieldConfig.className}>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-800">{fieldConfig.label}</h5>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {fieldConfig.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Placeholder:</strong> {fieldConfig.placeholder}
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>Key:</strong> <code>{fieldKey}</code>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};