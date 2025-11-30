'use client';

// Types
import { 
  DraggedIcon, 
  DashboardPage 
} from './types/types';

interface ExpandedDashboardProps {
  dashboardPages: DashboardPage[];
  currentPage: number;
  isAnimating: boolean;
  draggedIcons: Array<DraggedIcon | null>;
  availableTitles: string[];
  formatFieldName: (field: string) => string;
  onToggleExpand: () => void;
  onRemoveIcon: (index: number) => void;
  onPageChange: (pageId: number) => void;
  onAddPage: () => void;
  uuid: string | string[];
}

export default function ExpandedDashboard({
  dashboardPages,
  currentPage,
  isAnimating,
  draggedIcons,
  availableTitles,
  formatFieldName,
  onToggleExpand,
  onRemoveIcon,
  onPageChange,
  onAddPage,
  uuid
}: ExpandedDashboardProps) {
  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header en modo expandido con animación */}
        <div className={`bg-white rounded-lg shadow mb-4 p-4 flex justify-between items-center transition-all duration-500 ${
          isAnimating ? 'opacity-0 transform -translate-y-10' : 'opacity-100 transform translate-y-0'
        }`}>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard en Tiempo Real</h1>
              <p className="text-gray-600">UUID: {uuid}</p>
            </div>
            
            {/* Navegación de páginas en modo expandido */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {dashboardPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onPageChange(page.id)}
                    className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                      currentPage === page.id
                        ? 'bg-white shadow-sm text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {page.name}
                  </button>
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
            </div>
          </div>
          
          <button
            onClick={onToggleExpand}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
            title="Minimizar dashboard"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>

        {/* Dashboard en pantalla completa con animación */}
        <div className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ${
          isAnimating ? 'opacity-0 transform scale-95 translate-y-10' : 'opacity-100 transform scale-100 translate-y-0'
        }`}>
          <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
            {Array.from({ length: 4 }).map((_, idx) => {
              const iconInSpace = draggedIcons[idx];
              const title = availableTitles[idx];
              
              return (
                <div
                  key={idx}
                  className={`border-2 rounded-lg transition-all duration-500 relative ${
                    isAnimating 
                      ? 'opacity-0 transform translate-y-10 scale-95' 
                      : 'opacity-100 transform translate-y-0 scale-100'
                  } ${
                    iconInSpace 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-dashed border-gray-400 bg-gray-50'
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {iconInSpace ? (
                    <div className="flex flex-col h-full p-4">
                      {/* Header con título y botón eliminar */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="text-lg font-semibold text-gray-800 truncate">
                            {title || formatFieldName(iconInSpace.field)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <i className={`${iconInSpace.icon}`}></i>
                            <span className="capitalize">{iconInSpace.type}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveIcon(idx)}
                          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors flex-shrink-0 hover:scale-110 transition-transform duration-200"
                          title="Eliminar"
                        >
                          <i className="ti ti-x"></i>
                        </button>
                      </div>
                      
                      {/* Contenedor del mini gráfico */}
                      <div className="flex-1 min-h-0">
                        <div 
                          id={`dashboard-chart-${currentPage}-${idx}`} 
                          style={{ width: '100%', height: '100%', minHeight: '200px' }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500 text-lg text-center">
                        Arrastra un gráfico aquí
                        <br />
                        <span className="text-sm">Espacio {idx + 1}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}