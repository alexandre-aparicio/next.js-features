// app/advanced-features/drag-drop-3/forms-list/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Form {
  id: string;
  name: string;
  description: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export default function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://93.127.135.52:6011/forms/');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar formularios');
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este formulario?')) {
      return;
    }

    try {
      const response = await fetch(`http://93.127.135.52:6011/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar la lista después de eliminar
      setForms(forms.filter(form => form.id !== formId));
      alert('Formulario eliminado exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar formulario');
      console.error('Error deleting form:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Función para navegar al formulario específico
  const viewForm = (formId: string) => {
    window.open(`/advanced-features/drag-drop-3/forms/${formId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Cargando formularios...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchForms}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Formularios Guardados</h1>
            <p className="text-gray-600 mt-2">
              {forms.length} formulario{forms.length !== 1 ? 's' : ''} encontrado{forms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchForms}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Actualizar
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay formularios</h2>
            <p className="text-gray-600 mb-6">No se han encontrado formularios guardados en la base de datos.</p>
            <button
              onClick={() => window.location.href = '/advanced-features/drag-drop-3'}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Crear Primer Formulario
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{form.name}</div>
                        <div className="text-sm text-gray-500">ID: {form.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {form.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(form.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        v{form.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(form.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewForm(form.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver formulario"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(form.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Copiar ID"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => deleteForm(form.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Información de la API */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-800">Información de la API</h3>
              <p className="text-sm text-blue-700">Endpoint: GET http://93.127.135.52:6011/forms/</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">
                <strong>Total:</strong> {forms.length} formularios
              </p>
              <p className="text-sm text-blue-700">
                <strong>Activos:</strong> {forms.filter(f => f.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}