// app/advanced-features/drag-drop-3/preview/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface FormStructure {
  pagina: string;
  filas: {
    className: string;
    fields: {
      [key: string]: {
        label: string;
        type: string;
        placeholder: string;
        className: string;
        validate?: {
          required?: boolean;
          min4?: boolean;
        };
      };
    };
  }[];
}

export default function PreviewPage() {
  const [formData, setFormData] = useState<FormStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Obtener datos de sessionStorage
    const storedData = sessionStorage.getItem('formJsonData');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing JSON data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const saveToDatabase = async () => {
    if (formData.length === 0) {
      setSaveMessage('No hay datos para guardar');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const formPayload = {
        name: `Formulario ${new Date().toLocaleString()}`,
        description: 'Formulario generado desde el constructor',
        form_data: formData,
        drag_structure: [], // Puedes ajustar esto según tu estructura
        created_by: 'user@example.com' // Puedes hacer esto dinámico
      };

      const response = await fetch('http://93.127.135.52:6011/forms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPayload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSaveMessage(`✅ Formulario guardado exitosamente! ID: ${result.id}`);
      
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveMessage(`❌ Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (formData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No hay datos</h1>
          <p className="text-gray-600 mb-6">No se encontró ningún formulario generado.</p>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Volver al Constructor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Vista Previa del Formulario</h1>
          <div className="flex gap-2">
            <button
              onClick={saveToDatabase}
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {saving ? 'Guardando...' : '💾 Guardar en BD'}
            </button>
            <button
              onClick={handleBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Volver al Constructor
            </button>
          </div>
        </div>

        {/* Mensaje de estado */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            saveMessage.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Pestañas de páginas */}
        <div className="flex border-b border-gray-200 mb-6">
          {formData.map((pagina, index) => (
            <button
              key={index}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {pagina.pagina}
            </button>
          ))}
        </div>

        {/* Contenido de la página activa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            {formData[activeTab]?.pagina}
          </h2>
          
          <div className="space-y-6">
            {formData[activeTab]?.filas.map((fila, filaIndex) => (
              <div key={filaIndex} className={fila.className}>
                {Object.entries(fila.fields).map(([fieldName, fieldConfig]) => (
                  <div key={fieldName} className={fieldConfig.className}>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {fieldConfig.label}
                          {fieldConfig.validate?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type={fieldConfig.type}
                          placeholder={fieldConfig.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <div><strong>Nombre del campo:</strong> {fieldName}</div>
                        <div><strong>Tipo:</strong> {fieldConfig.type}</div>
                        {fieldConfig.validate?.required && (
                          <div className="text-green-600 font-medium">Campo obligatorio</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navegación entre páginas */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Página Anterior
          </button>
          
          <span className="text-gray-600">
            Página {activeTab + 1} de {formData.length}
          </span>
          
          <button
            onClick={() => setActiveTab(prev => Math.min(formData.length - 1, prev + 1))}
            disabled={activeTab === formData.length - 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === formData.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Siguiente Página
          </button>
        </div>

        {/* Información del formulario */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Información del Formulario</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Páginas:</strong> {formData.length}</p>
            <p><strong>Total de campos:</strong> {formData.reduce((total, pagina) => 
              total + pagina.filas.reduce((rowTotal, fila) => 
                rowTotal + Object.keys(fila.fields).length, 0), 0)}
            </p>
            <p><strong>URL API:</strong> http://93.127.135.52:6011/forms/</p>
          </div>
        </div>
      </div>
    </div>
  );
}