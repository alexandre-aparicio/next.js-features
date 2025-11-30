// app/advanced-features/drag-drop-3/forms/[uuid]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FormFieldRenderer } from './FormFieldRenderer';

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
  selectType?: 'single' | 'multiple';
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

// Nueva interfaz para respuestas organizadas por página
interface PageResponses {
  [pageName: string]: {
    [fieldName: string]: string | string[];
  };
}

interface PendingSubmission {
  form_id: string;
  user_id?: string;
  session_id: string;
  responses: PageResponses; // Cambiado para organizar por páginas
  timestamp: number;
  retryCount: number;
  ip_address?: string;
  user_agent?: string;
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const ev = new CustomEvent('app-toast', { detail: { message, type } });
  window.dispatchEvent(ev);
}

function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, message: e.detail.message, type: e.detail.type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-xs w-full px-4 py-2 rounded shadow text-sm text-white transform transition-all duration-200
            ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function FormViewPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<{[key: string]: string | string[]}>({});
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = `pending_submissions_${uuid}`;
  
  const readPendingFromStorage = (): PendingSubmission[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading pending from storage', err);
      return [];
    }
  };

  const writePendingToStorage = (arr: PendingSubmission[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch (err) {
      console.error('Error writing pending to storage', err);
    }
  };

  // Función para organizar las respuestas por páginas
  const organizeResponsesByPage = (responses: {[key: string]: string | string[]}): PageResponses => {
    if (!form) return {};

    const pageResponses: PageResponses = {};

    // Inicializar estructura de páginas
    form.form_data.forEach(page => {
      pageResponses[page.pagina] = {};
    });

    // Organizar respuestas por página
    Object.entries(responses).forEach(([fieldName, value]) => {
      const fieldPage = findFieldPage(fieldName);
      if (fieldPage) {
        pageResponses[fieldPage][fieldName] = value;
      }
    });

    return pageResponses;
  };

  // Función para encontrar a qué página pertenece un campo
  const findFieldPage = (fieldName: string): string | null => {
    if (!form) return null;
    
    for (const page of form.form_data) {
      for (const row of page.filas) {
        if (row.fields[fieldName]) {
          return page.pagina;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      const storedCount = readPendingFromStorage().length;

      if (!online) {
        if (storedCount > 0) {
          showToast(`⚠️ Sin conexión. ${storedCount} formulario(s) almacenado(s) en caché.`, 'info');
        } else {
          showToast('⚠️ Sin conexión. Los formularios se guardarán localmente.', 'info');
        }
      } else {
        if (storedCount > 0) {
          showToast('📡 Conexión restaurada. Sincronizando formularios pendientes...', 'info');
        } else {
          showToast('✅ Conexión restaurada', 'success');
        }
      }

      setIsOnline(online);
      
      if (online) {
        const stored = readPendingFromStorage();
        if (stored.length > 0) {
          setPendingSubmissions(stored);
          setTimeout(() => processPendingSubmissions(), 200);
        }
      }
    };

    const loadPendingSubmissions = () => {
      const stored = readPendingFromStorage();
      if (stored && stored.length > 0) {
        setPendingSubmissions(stored);
      }
    };

    checkOnlineStatus();
    loadPendingSubmissions();

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    const interval = setInterval(checkOnlineStatus, 30000);

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

  const submitToAPI = async (submission: PendingSubmission): Promise<boolean> => {
    try {
      // Procesar respuestas manteniendo la estructura por páginas
      const processedResponses: { [pageName: string]: { [key: string]: string } } = {};
      
      Object.entries(submission.responses).forEach(([pageName, pageFields]) => {
        processedResponses[pageName] = {};
        Object.entries(pageFields).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            processedResponses[pageName][key] = value.join(', ');
          } else {
            processedResponses[pageName][key] = value;
          }
        });
      });

      const response = await fetch(`http://93.127.135.52:6011/form-responses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: submission.form_id,
          user_id: submission.user_id,
          session_id: submission.session_id,
          responses: processedResponses, // Ahora organizado por páginas
          ip_address: submission.ip_address || '',
          user_agent: submission.user_agent || navigator.userAgent,
          submitted_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Formulario enviado a API:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Error en API:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error enviando a API:', error);
      return false;
    }
  };

  const processPendingSubmissions = async () => {
    const stored = readPendingFromStorage();
    if (!navigator.onLine || stored.length === 0) return;

    setIsSubmitting(true);
    
    const successfulIndices: number[] = [];
    const failedSubmissions: PendingSubmission[] = [];

    for (let i = 0; i < stored.length; i++) {
      const submission = stored[i];
      try {
        const success = await submitToAPI(submission);
        if (success) {
          successfulIndices.push(i);
        } else {
          failedSubmissions.push({
            ...submission,
            retryCount: (submission.retryCount || 0) + 1
          });
        }
      } catch (error) {
        console.error('Error processing submission:', error);
        failedSubmissions.push({
          ...submission,
          retryCount: (submission.retryCount || 0) + 1
        });
      }
    }

    const updatedPending = failedSubmissions;
    setPendingSubmissions(updatedPending);
    writePendingToStorage(updatedPending);

    if (successfulIndices.length > 0) {
      showToast(`✅ Se enviaron ${successfulIndices.length} formulario(s) pendientes`, 'success');
    }
    if (failedSubmissions.length > 0) {
      showToast(`⚠️ ${failedSubmissions.length} formulario(s) quedaron sin enviar y permanecerán en caché`, 'error');
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
      
      const initialValues: {[key: string]: string | string[]} = {};
      data.form_data.forEach((page: FormPage) => {
        page.filas.forEach((row: FormRow) => {
          Object.keys(row.fields).forEach(fieldName => {
            const field = row.fields[fieldName];
            if (field.type === 'select' && field.selectType === 'multiple') {
              initialValues[fieldName] = [];
            } else {
              initialValues[fieldName] = '';
            }
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

  const handleInputChange = (fieldName: string, value: string | string[]) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const savePendingSubmission = (submission: PendingSubmission) => {
    const newPendingSubmissions = [...readPendingFromStorage(), submission];
    setPendingSubmissions(newPendingSubmissions);
    writePendingToStorage(newPendingSubmissions);
    
    console.log('📦 Formulario guardado para envío offline');
    showToast(`📦 Guardado en caché. Pendientes: ${newPendingSubmissions.length}`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledFields = Object.values(formValues).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      } else {
        return value.trim() !== '';
      }
    }).length;
    
    const totalFields = Object.keys(formValues).length;

    if (filledFields === 0) {
      showToast('⚠️ Por favor, completa al menos un campo del formulario.', 'error');
      return;
    }

    // Organizar respuestas por páginas antes de enviar
    const organizedResponses = organizeResponsesByPage(formValues);

    const submission: PendingSubmission = {
      form_id: uuid,
      user_id: 'usuario-actual',
      session_id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      responses: organizedResponses, // Usar respuestas organizadas por páginas
      timestamp: Date.now(),
      retryCount: 0,
      ip_address: '',
      user_agent: navigator.userAgent
    };

    if (isOnline) {
      setIsSubmitting(true);
      try {
        const success = await submitToAPI(submission);
        
        if (success) {
          showToast(`✅ Formulario enviado exitosamente (${filledFields}/${totalFields})`, 'success');
          
          const resetValues: {[key: string]: string | string[]} = {};
          Object.keys(formValues).forEach(key => {
            const field = findFieldConfig(key);
            if (field && field.type === 'select' && field.selectType === 'multiple') {
              resetValues[key] = [];
            } else {
              resetValues[key] = '';
            }
          });
          setFormValues(resetValues);
        } else {
          savePendingSubmission(submission);
          showToast(`⚠️ Error al enviar. Formulario guardado para reintentar. (${filledFields}/${totalFields})`, 'error');
        }
      } catch (error) {
        savePendingSubmission(submission);
        showToast(`⚠️ Error de conexión. Formulario guardado para enviar luego. (${filledFields}/${totalFields})`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      savePendingSubmission(submission);
      const newCount = readPendingFromStorage().length;
      showToast(`📦 Formulario guardado. Pendientes: ${newCount}`, 'info');
    }
    
    console.log('Datos del formulario organizados por páginas:', organizedResponses);
  };

  const findFieldConfig = (fieldName: string): FormField | null => {
    if (!form) return null;
    
    for (const page of form.form_data) {
      for (const row of page.filas) {
        if (row.fields[fieldName]) {
          return row.fields[fieldName];
        }
      }
    }
    return null;
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

  const clearPendingSubmissions = () => {
    setPendingSubmissions([]);
    writePendingToStorage([]);
    showToast('🗑️ Formularios pendientes eliminados', 'info');
  };

  const countSelectionFields = () => {
    if (!form) return 0;
    
    return form.form_data.reduce((total, page) => {
      return total + page.filas.reduce((rowTotal, row) => {
        return rowTotal + Object.values(row.fields).filter(field => 
          field.type === 'select' && field.options && field.options.length > 0
        ).length;
      }, 0);
    }, 0);
  };

  // Función para mostrar información de las páginas y campos
  const getPageFieldInfo = () => {
    if (!form) return [];
    
    return form.form_data.map(page => ({
      pageName: page.pagina,
      fieldCount: page.filas.reduce((total, row) => total + Object.keys(row.fields).length, 0),
      filledCount: Object.keys(formValues).filter(fieldName => {
        const value = formValues[fieldName];
        const isFilled = Array.isArray(value) ? value.length > 0 : value.trim() !== '';
        return isFilled && findFieldPage(fieldName) === page.pagina;
      }).length
    }));
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

  const pageFieldInfo = getPageFieldInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
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
          
          {pendingSubmissions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  📦 {pendingSubmissions.length} formulario{pendingSubmissions.length !== 1 ? 's' : ''} pendiente{pendingSubmissions.length !== 1 ? 's' : ''}
                </span>

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                {form.form_data[activeTab]?.pagina}
              </h2>
              <div className="text-sm text-gray-500">
                {pageFieldInfo[activeTab]?.filledCount} de {pageFieldInfo[activeTab]?.fieldCount} campos completados
              </div>
            </div>
            
            <div className="space-y-6">
              {form.form_data[activeTab]?.filas.map((fila, filaIndex) => (
                <div key={filaIndex} className={fila.className}>
                  {Object.entries(fila.fields).map(([fieldName, fieldConfig]) => (
                    <FormFieldRenderer
                      key={fieldName}
                      fieldName={fieldName}
                      fieldConfig={fieldConfig}
                      value={formValues[fieldName] || (fieldConfig.selectType === 'multiple' ? [] : '')}
                      onChange={handleInputChange}
                    />
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
              <p><strong>Campos de selección:</strong> {countSelectionFields()}</p>
            </div>
            <div>
              <p><strong>Creado por:</strong> {form.created_by || 'N/A'}</p>
              <p><strong>Última actualización:</strong> {formatDate(form.updated_at)}</p>
            </div>
          </div>
          
          {/* Información por página */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Progreso por página:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {pageFieldInfo.map((pageInfo, index) => (
                <div key={index} className={`p-2 rounded ${
                  activeTab === index ? 'bg-blue-100 border border-blue-300' : 'bg-blue-50'
                }`}>
                  <div className="font-medium">{pageInfo.pageName}</div>
                  <div className="text-blue-600">
                    {pageInfo.filledCount}/{pageInfo.fieldCount} campos
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-blue-600">
            <p><strong>Endpoint API:</strong> http://93.127.135.52:6011/form-responses/</p>
            <p><strong>Estructura de envío:</strong> Respuestas organizadas por páginas</p>
          </div>
        </div>
      </div>
    </div>
  );
}