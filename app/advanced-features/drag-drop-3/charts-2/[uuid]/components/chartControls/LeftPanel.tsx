'use client';

import { useState, useEffect } from 'react';
import { 
  ChartType, 
  ChartIcon, 
  DraggedIcon,
  FormResponse 
} from '../../types/types';

interface ChartControlsProps {
  selectedField: string;
  selectedIcon: ChartType;
  formFields: string[];
  availableIcons: ChartIcon[];
  formatFieldName: (field: string) => string;
  onFieldClick: (field: string) => void;
  onIconClick: (iconName: ChartType) => void;
  onDragStart: (e: React.DragEvent, iconData: Omit<DraggedIcon, 'field'>) => void;
  selectedXField?: string;
  selectedYField?: string;
  onXFieldChange?: (field: string) => void;
  onYFieldChange?: (field: string) => void;
  onApplyXYSelection?: (xField: string, yField: string) => void;
  xyChartActive?: boolean;
  activeXField?: string;
  activeYField?: string;
  onResetXYSelection?: () => void;
  onFieldDrop?: (field: string, axis: 'x' | 'y') => void;
  responses: FormResponse[];
  selectedIconXy: XYChartType; // ← Agregar esta prop
  onXYIconClick: (iconName: XYChartType) => void;
}

interface PageFields {
  [pageName: string]: string[];
}

// Definir los tipos de gráficos XY disponibles
type XYChartType = 'xyChart' | 'xyChart-2' | 'xyChart-3';

export default function ChartControls({
  selectedField,
  selectedIcon,
  formFields,
  availableIcons,
  formatFieldName,
  onFieldClick,
  onIconClick,
  onDragStart,
  selectedXField,
  selectedYField,
  onXFieldChange,
  onYFieldChange,
  onApplyXYSelection,
  xyChartActive = false,
  activeXField = '',
  activeYField = '',
  onResetXYSelection,
  onFieldDrop,
  selectedIconXy, 
  onXYIconClick, 
  responses
}: ChartControlsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pageFields, setPageFields] = useState<PageFields>({});
  const [pageTabs, setPageTabs] = useState<string[]>(['all']);
  const handleXYTypeSelect = (type: XYChartType) => {
    onXYIconClick(type); // ← Usar la prop del padre
  };
  // Organizar campos por página
  useEffect(() => {
    const pages: PageFields = { all: formFields };
    const tabs = ['all'];

    // Procesar todas las respuestas para extraer la estructura de páginas
    if (responses.length > 0) {
      const firstResponse = responses[0];
      
      Object.keys(firstResponse.responses).forEach(pageKey => {
        const pageName = formatPageName(pageKey);
        tabs.push(pageName);
        
        // Extraer campos de esta página de la primera respuesta
        const pageData = firstResponse.responses[pageKey];
        if (pageData && typeof pageData === 'object') {
          pages[pageName] = Object.keys(pageData);
        } else {
          pages[pageName] = [];
        }
      });
    }

    setPageFields(pages);
    setPageTabs(tabs);
    
    // Si hay páginas, establecer la primera como activa
    if (tabs.length > 1 && activeTab === 'all') {
      setActiveTab(tabs[1]); // Primera página específica en lugar de "all"
    }
  }, [formFields, responses]);

  const formatPageName = (pageKey: string): string => {
    return pageKey.replace(/_/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase())
                 .replace('Pagina', 'Página');
  };

  const getCurrentFields = (): string[] => {
    if (activeTab === 'all') {
      return formFields;
    }
    return pageFields[activeTab] || [];
  };

  const canApplyXY = selectedXField && selectedYField && selectedXField !== selectedYField;
  const canDragXY = xyChartActive && activeXField && activeYField;
  
  const handleResetXY = () => {
    if (onResetXYSelection) {
      onResetXYSelection();
    }
  };

  // Función para obtener el icono según el tipo seleccionado
  const getXYIcon = (type: XYChartType): string => {
    switch (type) {
      case 'xyChart': return 'ti ti-chart-scatter';
      case 'xyChart-2': return 'ti ti-chart-line';
      case 'xyChart-3': return 'ti ti-chart-bar';
      default: return 'ti ti-chart-scatter';
    }
  };

  // Función para obtener el título según el tipo seleccionado
  const getXYTitle = (type: XYChartType): string => {
    switch (type) {
      case 'xyChart': return 'Dispersión';
      case 'xyChart-2': return 'Líneas';
      case 'xyChart-3': return 'Barras';
      default: return 'Dispersión';
    }
  };

  const handleXYDragStart = (e: React.DragEvent, type: XYChartType) => {
    if (!canDragXY) return;
    
    const dragData: DraggedIcon = {
      icon: getXYIcon(type),
      field: `${activeXField}___${activeYField}`,
      type: 'xy', // Mantener el tipo original 'xy' para que funcione
      title: `${getXYTitle(type)}: ${formatFieldName(activeXField)} vs ${formatFieldName(activeYField)}`
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };



  // Handler simplificado para eliminar campos X/Y - SOLO resetear la configuración local
  const handleRemoveXField = (e: React.MouseEvent) => {
    e.stopPropagation();
    onXFieldChange?.('');
    onResetXYSelection?.();
  };

  const handleRemoveYField = (e: React.MouseEvent) => {
    e.stopPropagation();
    onYFieldChange?.('');
    onResetXYSelection?.();
  };

  // Handlers para drag & drop de campos a ejes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
  };

  const handleDrop = (e: React.DragEvent, axis: 'x' | 'y') => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
    
    try {
      const fieldData = e.dataTransfer.getData('text/plain');
      if (fieldData && onFieldDrop) {
        onFieldDrop(fieldData, axis);
        
        // Si después de este drop ambos campos están llenos, activar el gráfico automáticamente
        if (axis === 'x' && selectedYField && fieldData !== selectedYField) {
          setTimeout(() => {
            if (onApplyXYSelection) {
              onApplyXYSelection(fieldData, selectedYField);
            }
          }, 100);
        } else if (axis === 'y' && selectedXField && fieldData !== selectedXField) {
          setTimeout(() => {
            if (onApplyXYSelection) {
              onApplyXYSelection(selectedXField, fieldData);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error procesando drop:', error);
    }
  };

  // Determinar qué mostrar
  const showIndividualChart = selectedField && !xyChartActive;
  const showXYChart = xyChartActive && activeXField && activeYField;
  const showXYReady = selectedXField && selectedYField && !xyChartActive;

  const currentFields = getCurrentFields();

  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-col col-span-1">
      {/* Parte Superior: Configuración XY Simplificada */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">
          Gráfico XY
        </h3>

        {/* Espacios de arrastre para ejes */}
        <div className="grid grid-cols-4 gap-2 mb-3">
  <div></div>
  <div className="flex flex-col items-center">
    <div 
      className={`w-full border-2 rounded p-1 text-center min-h-[30px] flex items-center justify-center cursor-pointer transition-all duration-200 ${
        selectedXField 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, 'x')}
    >
      {selectedXField ? (
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-xs font-medium text-blue-700 truncate">
            {formatFieldName(selectedXField)}
          </span>
          <button 
            onClick={handleRemoveXField}
            className="text-red-500 hover:text-red-700 text-xs flex-shrink-0 ml-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <i className="ti ti-axis-x text-gray-400 text-lg"></i>
      )}
    </div>
    <span className="text-xs text-gray-500 mt-1">Eje X</span>
  </div>

  {/* Eje Y */}
  <div className="flex flex-col items-center">
    <div 
      className={`w-full border-2 rounded p-1 text-center min-h-[30px] flex items-center justify-center cursor-pointer transition-all duration-200 ${
        selectedYField 
          ? 'border-green-500 bg-green-50' 
          : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, 'y')}
    >
      {selectedYField ? (
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-xs font-medium text-green-700 truncate">
            {formatFieldName(selectedYField)}
          </span>
          <button 
            onClick={handleRemoveYField}
            className="text-red-500 hover:text-red-700 text-xs flex-shrink-0 ml-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <i className="ti ti-axis-y text-gray-400 text-lg"></i>
      )}
    </div>
    <span className="text-xs text-gray-500 mt-1">Eje Y</span>
  </div>
</div>

        {/* TRES BOTONES VERDES INDEPENDIENTES */}
        {canDragXY && (
          <div className="mb-2">
            <div className="grid grid-cols-3 gap-2">
              {/* Botón 1: Scatter */}
              <button
                draggable
                onDragStart={(e) => handleXYDragStart(e, 'xyChart')}
                onClick={() => handleXYTypeSelect('xyChart')}
                className={`w-full py-1 px-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing ${
                  selectedIconXy === 'xyChart'
                    ? 'bg-green-600 text-white border-2 border-green-700 shadow-md'
                    : 'bg-green-500 hover:bg-green-600 text-white border border-green-600 shadow-sm'
                }`}
                title="Arrastra al dashboard para añadir gráfico de dispersión"
              >
                <i className="ti ti-chart-scatter text-xs"></i>
                Dispersión
              </button>

              {/* Botón 2: Líneas */}
              <button
                draggable
                onDragStart={(e) => handleXYDragStart(e, 'xyChart-2')}
                onClick={() => handleXYTypeSelect('xyChart-2')}
                className={`w-full py-1 px-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing ${
                  selectedIconXy === 'xyChart-2'
                    ? 'bg-green-600 text-white border-2 border-green-700 shadow-md'
                    : 'bg-green-500 hover:bg-green-600 text-white border border-green-600 shadow-sm'
                }`}
                title="Arrastra al dashboard para añadir gráfico de líneas"
              >
                <i className="ti ti-chart-line text-xs"></i>
                Líneas
              </button>

              {/* Botón 3: Barras */}
              <button
                draggable
                onDragStart={(e) => handleXYDragStart(e, 'xyChart-3')}
                onClick={() => handleXYTypeSelect('xyChart-3')}
                className={`w-full py-1 px-2 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing ${
                  selectedIconXy === 'xyChart-3'
                    ? 'bg-green-600 text-white border-2 border-green-700 shadow-md'
                    : 'bg-green-500 hover:bg-green-600 text-white border border-green-600 shadow-sm'
                }`}
                title="Arrastra al dashboard para añadir gráfico de barras"
              >
                <i className="ti ti-chart-bar text-xs"></i>
                Barras
              </button>
            </div>
          </div>
        )}

        {/* Tabs para páginas */}
        {pageTabs.length > 1 && (
          <div className="mb-2">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {pageTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'all' ? 'Todos' : tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campos disponibles para arrastrar - Organizados por pestaña */}
        <div className="mb-2">
          
          <div className="flex flex-row flex-wrap gap-1 max-h-20 overflow-y-auto">
            {currentFields.map((f) => (
  <div
    key={f}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('text/plain', f);
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={() => onFieldClick(f)}
    className={`w-[calc(25%-4px)] px-2 py-1 rounded border text-xs transition-all duration-200 cursor-grab active:cursor-grabbing flex-shrink-0 ${
      selectedField === f
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`}
    title={formatFieldName(f)}
  >
    <div className="flex items-center gap-1">
      <span className="truncate flex-1">{formatFieldName(f)}</span>
      <i className="ti ti-grip-horizontal text-gray-400 text-xs flex-shrink-0"></i>
    </div>
  </div>
))}
            {currentFields.length === 0 && (
              <div className="text-xs text-gray-500 italic px-2 py-1">
                No hay campos en esta página
              </div>
            )}
          </div>
        </div>

        {/* Tipos de Gráficos Individuales */}
        {selectedField && !xyChartActive && (
  <div className="mt-2">
    <h3 className="text-xs font-semibold text-gray-700 mb-1">Tipos</h3>
    <div className="grid grid-cols-8 gap-1">
      {availableIcons.map((icon) => (
        <button
          key={icon.name}
          draggable={!icon.disabled}
          onDragStart={(e) => onDragStart(e, { 
            icon: icon.icon, 
            type: icon.name, 
            title: icon.title 
          })}
          onClick={() => onIconClick(icon.name)}
          className={`aspect-square w-full border text-sm transition-all duration-200 flex items-center justify-center ${
            icon.disabled 
              ? 'cursor-not-allowed opacity-30 border-gray-200 bg-gray-100 text-gray-400' 
              : selectedIcon === icon.name 
                ? 'border-blue-500 bg-blue-100 text-blue-600 cursor-pointer' 
                : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-grab active:cursor-grabbing'
          }`}
          title={icon.disabled ? `${icon.title} (Ya asignado)` : icon.title}
          disabled={icon.disabled}
        >
          <i className={icon.icon}></i>
        </button>
      ))}
    </div>
  </div>
)}

        
      </div>

      {/* Vista previa del gráfico */}
      <div className="flex-1 border-t pt-2">
        <h3 className="text-sm font-semibold mb-1 text-center text-gray-800">
          {showIndividualChart ? `${formatFieldName(selectedField)}` : 
           showXYChart ? `${formatFieldName(activeXField)} vs ${formatFieldName(activeYField)} (${getXYTitle(selectedIconXy)})` :
           showXYReady ? `${formatFieldName(selectedXField)} vs ${formatFieldName(selectedYField)}` :
           'Vista previa'}
        </h3>
        <div className="flex items-center justify-center h-[calc(100%-28px)]">
          {showIndividualChart ? (
            <div className="w-full h-full">
              {selectedIcon === 'bar' && <div id="chartdiv2" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'donut' && <div id="chartdiv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'tree' && <div id="treemapdiv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'variable' && <div id="radiusPiediv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'semi' && <div id="chartSemiCircle" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'force' && <div id="chartForceDirected" style={{ width: '100%', height: '100%' }} />}
            </div>
          ) : (showXYChart || showXYReady) ? (
            <div className="w-full h-full">
              {/* Renderizar diferentes gráficos XY según el tipo seleccionado */}
              {selectedIconXy === 'xyChart' && <div id="xyChart" style={{ width: '100%', height: '100%' }} />}
              {selectedIconXy === 'xyChart-2' && <div id="xyChart-2" style={{ width: '100%', height: '100%' }} />}
              {selectedIconXy === 'xyChart-3' && <div id="xyChart-3" style={{ width: '100%', height: '100%' }} />}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded w-full">
              <div className="text-gray-400 text-xs text-center px-2">
                <i className="ti ti-chart-scatter text-base mb-1 block"></i>
                {selectedXField || selectedYField 
                  ? 'Arrastra ambos campos'
                  : 'Configura los ejes'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}