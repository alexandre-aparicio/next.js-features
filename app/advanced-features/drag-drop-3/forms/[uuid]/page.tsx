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

interface PendingSubmission {
  form_id: string;
  user_id?: string;
  session_id: string;
  responses: { [key: string]: string };
  timestamp: number;
  retryCount: number;
}

export default function FormViewPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<{[key: string]: string}>({});
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar conexión a internet y cargar submissions pendientes
  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Si se recupera la conexión, intentar enviar pendientes
      if (online) {
        processPendingSubmissions();
      }
    };

    // Cargar submissions pendientes del localStorage
    const loadPendingSubmissions = () => {
      try {
        const stored = localStorage.getItem(`pending_submissions_${uuid}`);
        if (stored) {
          setPendingSubmissions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading pending submissions:', error);
      }
    };

    // Verificar inicialmente
    checkOnlineStatus();
    loadPendingSubmissions();

    // Configurar event listeners
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Verificar cada 30 segundos
    const interval = setInterval(checkOnlineStatus, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      clearInterval(interval);
    };
  }, [uuid]);

  useEffect(() => {
    if (uuid) {
      fetchForm();
    }
  }, [uuid]);

  // Procesar submissions pendientes cuando hay conexión
  const processPendingSubmissions = async () => {
    if (!isOnline || pendingSubmissions.length === 0) return;

    setIsSubmitting(true);
    
    const successfulSubmissions: number[] = [];
    const failedSubmissions: PendingSubmission[] = [];

    for (let i = 0; i < pendingSubmissions.length; i++) {
      const submission = pendingSubmissions[i];
      
      try {
        const success = await submitToAPI(submission);
        if (success) {
          successfulSubmissions.push(i);
        } else {
          // Incrementar contador de reintentos
          failedSubmissions.push({
            ...submission,
            retryCount: submission.retryCount + 1
          });
        }
      } catch (error) {
        console.error('Error processing submission:', error);
        failedSubmissions.push({
          ...submission,
          retryCount: submission.retryCount + 1
        });
      }
    }

    // Actualizar localStorage
    if (successfulSubmissions.length > 0 || failedSubmissions.length > 0) {
      const updatedPending = failedSubmissions;
      setPendingSubmissions(updatedPending);
      localStorage.setItem(`pending_submissions_${uuid}`, JSON.stringify(updatedPending));
      
      if (successfulSubmissions.length > 0) {
        console.log(`✅ Enviados ${successfulSubmissions.length} formularios pendientes`);
      }
    }

    setIsSubmitting(false);
  };

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

  // Función para enviar a la API
  const submitToAPI = async (submission: PendingSubmission): Promise<boolean> => {
    try {
      const response = await fetch(`http://93.127.135.52:6011/api/responses/${submission.form_id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Formulario enviado a API:', result);
        return true;
      } else {
        console.error('❌ Error en API:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando a API:', error);
      return false;
    }
  };

  // Función para guardar submission pendiente
  const savePendingSubmission = (submission: PendingSubmission) => {
    const newPendingSubmissions = [...pendingSubmissions, submission];
    setPendingSubmissions(newPendingSubmissions);
    
    // Guardar en localStorage
    localStorage.setItem(`pending_submissions_${uuid}`, JSON.stringify(newPendingSubmissions));
    
    console.log('📦 Formulario guardado para envío offline');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledFields = Object.values(formValues).filter(value => value.trim() !== '').length;
    const totalFields = Object.keys(formValues).length;

    // Crear objeto de submission
    const submission: PendingSubmission = {
      form_id: uuid,
      user_id: 'usuario-actual', // Puedes obtener esto de tu sistema de auth
      session_id: `session-${Date.now()}`,
      responses: formValues,
      timestamp: Date.now(),
      retryCount: 0
    };

    if (isOnline) {
      // Intentar enviar directamente
      setIsSubmitting(true);
      try {
        const success = await submitToAPI(submission);
        
        if (success) {
          alert(`✅ Formulario enviado exitosamente!\nCampos llenados: ${filledFields}/${totalFields}`);
          // Limpiar formulario después del envío exitoso
          setFormValues({});
        } else {
          // Si falla el envío online, guardar como pendiente
          savePendingSubmission(submission);
          alert(`⚠️ Error al enviar. Formulario guardado para reintentar.\nCampos llenados: ${filledFields}/${totalFields}`);
        }
      } catch (error) {
        // Si hay error, guardar como pendiente
        savePendingSubmission(submission);
        alert(`⚠️ Error de conexión. Formulario guardado para enviar luego.\nCampos llenados: ${filledFields}/${totalFields}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Guardar para envío offline
      savePendingSubmission(submission);
      alert(`📦 Formulario guardado para enviar cuando haya conexión.\nCampos llenados: ${filledFields}/${totalFields}\n\nPendientes: ${pendingSubmissions.length + 1}`);
    }
    
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

  // Limpiar submissions pendientes (opcional)
  const clearPendingSubmissions = () => {
    setPendingSubmissions([]);
    localStorage.removeItem(`pending_submissions_${uuid}`);
    alert('🗑️ Formularios pendientes eliminados');
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
        {/* Indicador de conexión y estado */}
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          isOnline 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">
                {isOnline ? '✅ Conectado a Internet' : '⚠️ Sin conexión a Internet'}
              </span>
            </div>
            <div className="text-sm">
              {isOnline 
                ? `Pendientes: ${pendingSubmissions.length}`
                : 'Los formularios se guardarán localmente'
              }
            </div>
          </div>
          
          {/* Información de submissions pendientes */}
          {pendingSubmissions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  📦 {pendingSubmissions.length} formulario{pendingSubmissions.length !== 1 ? 's' : ''} pendiente{pendingSubmissions.length !== 1 ? 's' : ''}
                </span>
                {isOnline && !isSubmitting && (
                  <button
                    onClick={processPendingSubmissions}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Reintentar Envío
                  </button>
                )}
                {isOnline && isSubmitting && (
                  <span className="text-xs">Enviando...</span>
                )}
                <button
                  onClick={clearPendingSubmissions}
                  className="text-red-500 hover:text-red-700 text-xs"
                  title="Eliminar pendientes"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resto del código del formulario se mantiene igual */}
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
                  onClick={() => window.open('/advanced-features/drag-drop-3/forms-list', '_self')}
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
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors text-lg ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : isOnline
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                  : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
              }`}
            >
              {isSubmitting 
                ? '⏳ Enviando...' 
                : isOnline 
                ? '📨 Enviar Formulario' 
                : '📦 Guardar para Enviar'
              }
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