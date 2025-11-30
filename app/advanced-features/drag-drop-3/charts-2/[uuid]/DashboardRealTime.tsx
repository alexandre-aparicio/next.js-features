'use client';

import { useState } from 'react';

// Types
import { 
  ChartType, 
  DraggedIcon, 
  DashboardPage
} from './types/types';

interface DashboardRealTimeProps {
  dashboardPages: DashboardPage[];
  currentPage: number;
  isAnimating: boolean;
  draggedIcons: Array<DraggedIcon | null>;
  availableTitles: string[];
  formatFieldName: (field: string) => string;
  onPageChange: (pageId: number) => void;
  onAddPage: () => void;
  onRemovePage: (pageId: number) => void;
  onToggleExpand: () => void;
  onRemoveIcon: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onTitleChange: (index: number, value: string) => void;
  uuid: string | string[];
}

export default function DashboardRealTime({
  dashboardPages,
  currentPage,
  isAnimating,
  draggedIcons,
  availableTitles,
  formatFieldName,
  onPageChange,
  onAddPage,
  onRemovePage,
  onToggleExpand,
  onRemoveIcon,
  onDragOver,
  onDragLeave,
  onDrop,
  onTitleChange,
  uuid
}: DashboardRealTimeProps) {
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const handleTitleEditStart = (index: number, currentTitle: string) => {
    setEditingTitleIndex(index);
    setTempTitle(currentTitle);
  };

  const handleTitleEditSave = (index: number) => {
    onTitleChange(index, tempTitle);
    setEditingTitleIndex(null);
    setTempTitle('');
  };

  const handleTitleEditCancel = () => {
    setEditingTitleIndex(null);
    setTempTitle('');
  };

  const handleDeleteClick = (pageId: number) => {
    setShowDeleteModal(pageId);
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      onRemovePage(showDeleteModal);
      setShowDeleteModal(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(null);
  };

  return (
    <>
      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ti ti-alert-triangle text-red-600 text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Eliminar página</h3>
                <p className="text-sm text-gray-600">¿Estás seguro de que quieres eliminar esta página?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-lg shadow p-4 col-span-3 transition-all duration-500 ${
        isAnimating ? 'opacity-0 transform -translate-x-10' : 'opacity-100 transform translate-x-0'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Dashboard en Tiempo Real</h2>
          <div className="flex items-center gap-2">
            {/* Navegación de páginas */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {dashboardPages.map((page) => (
                <div key={page.id} className="relative group">
                  <div className="relative"> {/* Cambié button por div */}
                    <button
                      onClick={() => onPageChange(page.id)}
                      className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                        currentPage === page.id
                          ? 'bg-white shadow-sm text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {page.name}
                    </button>
                    {dashboardPages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(page.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs hover:bg-red-600"
                        title="Eliminar página"
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botón para añadir nueva página */}
            <button
              onClick={onAddPage}
              className="w-8 h-8 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-all duration-300 hover:scale-110"
              title="Añadir nueva página"
            >
              <i className="ti ti-plus text-lg"></i>
            </button>

            <button
              onClick={onToggleExpand}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-300 hover:scale-110"
              title="Expandir dashboard"
            >
              <i className="ti ti-arrow-up-left text-lg"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 h-[calc(100%-60px)]">
          {Array.from({ length: 4 }).map((_, idx) => {
            const iconInSpace = draggedIcons[idx];
            const title = availableTitles[idx];
            
            return (
              <div
                key={idx}
                className={`border-2 rounded-lg transition-all duration-300 relative ${
                  isAnimating 
                    ? 'opacity-0 transform scale-95' 
                    : 'opacity-100 transform scale-100'
                } ${
                  iconInSpace 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, idx)}
              >
                {iconInSpace ? (
                  <div className="flex flex-col h-full p-2">
                    {/* Header con título y botón eliminar */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0 mr-2">
                        {editingTitleIndex === idx ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="text-xs font-semibold border border-gray-300 rounded px-1 py-0.5 w-full"
                              placeholder="Título del gráfico"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleEditSave(idx);
                                if (e.key === 'Escape') handleTitleEditCancel();
                              }}
                            />
                            <button
                              onClick={() => handleTitleEditSave(idx)}
                              className="w-4 h-4 flex items-center justify-center text-green-600 hover:bg-green-100 rounded"
                              title="Guardar"
                            >
                              <i className="ti ti-check text-xs"></i>
                            </button>
                            <button
                              onClick={handleTitleEditCancel}
                              className="w-4 h-4 flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
                              title="Cancelar"
                            >
                              <i className="ti ti-x text-xs"></i>
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="font-semibold text-gray-800 truncate cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 flex items-center justify-center min-h-[24px]"
                            style={{
                              fontSize: `clamp(0.875rem, ${5 - (title?.length || 0) * 0.08}rem, 1.125rem)`
                            }}
                            onClick={() => handleTitleEditStart(idx, title)}
                            title="Haz clic para editar el título"
                          >
                            {title || formatFieldName(iconInSpace.field)}
                          </div>
                        )}
                        
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onRemoveIcon(idx)}
                          className="w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all duration-200 hover:scale-110 flex-shrink-0"
                          title="Eliminar"
                        >
                          <i className="ti ti-x text-xs"></i>
                        </button>
                      </div>
                    </div>
                    
                    {/* Contenedor del mini gráfico */}
                    <div className="flex-1 min-h-0 mt-1">
                      <div 
                        id={`dashboard-chart-${currentPage}-${idx}`} 
                        style={{ width: '100%', height: '100%', minHeight: '60px' }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-500 text-xs text-center">
                      Arrastra un gráfico aquí
                      <br />
                      <span className="text-xs">Espacio {idx + 1}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}