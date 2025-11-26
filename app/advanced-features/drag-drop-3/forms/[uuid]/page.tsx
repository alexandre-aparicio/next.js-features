// app/advanced-features/drag-drop-3/forms/[uuid]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FormField {
  label: string;
  type: string;
  placeholder: string;
  className: string;
  validate?: {
    required?: boolean;
    min4?: boolean;
  };
}

interface FormRow {
  className: string;
  fields: {
    [key: string]: FormField;
  };
}

interface FormPage {
  pagina: string;
  filas: FormRow[];
}

interface FormData {
  id: string;
  name: string;
  description: string;
  form_data: FormPage[];
  drag_structure: any[];
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export default function FormViewPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (uuid) {
      fetchForm();
    }
  }, [uuid]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://93.127.135.52:6011/forms/${uuid}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Formulario no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setForm(data);
      
      // Inicializar valores del formulario
      const initialValues: {[key: string]: string} = {};
      data.form_data.forEach((page: FormPage) => {
        page.filas.forEach((row: FormRow) => {
          Object.keys(row.fields).forEach(fieldName => {
            initialValues[fieldName] = '';
          });
        });
      });
      setFormValues(initialValues);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el formulario');
      console.error('Error fetching form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledFields = Object.values(formValues).filter(value => value.trim() !== '').length;
    const totalFields = Object.keys(formValues).length;
    
    alert(`✅ Formulario enviado!\nCampos llenados: ${filledFields}/${totalFields}\n\nDatos:\n${JSON.stringify(formValues, null, 2)}`);
    
    // Aquí puedes enviar los datos a tu API
    console.log('Datos del formulario:', formValues);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Borrador' },
      active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
      archived: { color: 'bg-orange-100 text-orange-800', label: 'Archivado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Cargando formulario...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-sm text-gray-500 mt-2">UUID: {uuid}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-2">{error}</p>
          <div className="text-sm text-gray-500 mb-6">UUID: {uuid}</div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={fetchForm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Formulario no encontrado</h1>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header del formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.name}</h1>
              <p className="text-gray-600 mb-3">{form.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>UUID: <code className="bg-gray-100 px-2 py-1 rounded">{uuid}</code></span>
                <span>Versión: v{form.version}</span>
                {getStatusBadge(form.status)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">
                Creado: {formatDate(form.created_at)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => window.open('/advanced-features/drag-drop-3/forms', '_self')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  📋 Todos los Forms
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario interactivo */}
        <form onSubmit={handleSubmit}>
          {/* Pestañas de páginas */}
          {form.form_data.length > 1 && (
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg">
              {form.form_data.map((pagina, index) => (
                <button
                  key={index}
                  type="button"
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
          )}

          {/* Contenido del formulario */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              {form.form_data[activeTab]?.pagina}
            </h2>
            
            <div className="space-y-6">
              {form.form_data[activeTab]?.filas.map((fila, filaIndex) => (
                <div key={filaIndex} className={fila.className}>
                  {Object.entries(fila.fields).map(([fieldName, fieldConfig]) => (
                    <div key={fieldName} className={fieldConfig.className}>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {fieldConfig.label}
                            {fieldConfig.validate?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          
                          {fieldConfig.type === 'textarea' ? (
                            <textarea
                              value={formValues[fieldName] || ''}
                              onChange={(e) => handleInputChange(fieldName, e.target.value)}
                              placeholder={fieldConfig.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
                              required={fieldConfig.validate?.required}
                            />
                          ) : (
                            <input
                              type={fieldConfig.type}
                              value={formValues[fieldName] || ''}
                              onChange={(e) => handleInputChange(fieldName, e.target.value)}
                              placeholder={fieldConfig.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required={fieldConfig.validate?.required}
                            />
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 border-t pt-2">
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

          {/* Navegación y envío */}
          <div className="flex justify-between items-center">
            {form.form_data.length > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                  disabled={activeTab === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  ← Anterior
                </button>
                
                <span className="px-4 py-2 text-gray-600">
                  Página {activeTab + 1} de {form.form_data.length}
                </span>
                
                <button
                  type="button"
                  onClick={() => setActiveTab(prev => Math.min(form.form_data.length - 1, prev + 1))}
                  disabled={activeTab === form.form_data.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === form.form_data.length - 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            )}
            
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
            >
              📨 Enviar Formulario
            </button>
          </div>
        </form>

        {/* Información de la API */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Información del Formulario</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p><strong>Total de páginas:</strong> {form.form_data.length}</p>
              <p><strong>Total de campos:</strong> {Object.keys(formValues).length}</p>
            </div>
            <div>
              <p><strong>Creado por:</strong> {form.created_by || 'N/A'}</p>
              <p><strong>Última actualización:</strong> {formatDate(form.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}