'use client';

// Types
import { 
  ChartType, 
  ChartIcon, 
  DraggedIcon 
} from './types/types';

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
  onFieldDrop?: (field: string, axis: 'x' | 'y') => void; // Nueva prop
}

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
  onFieldDrop
}: ChartControlsProps) {
  const canApplyXY = selectedXField && selectedYField && selectedXField !== selectedYField;
  const canDragXY = xyChartActive && activeXField && activeYField;
  
  const handleApplyXY = () => {
    if (canApplyXY && onApplyXYSelection) {
      onApplyXYSelection(selectedXField, selectedYField);
    }
  };

  const handleResetXY = () => {
    if (onResetXYSelection) {
      onResetXYSelection();
    }
  };

  const handleXYDragStart = (e: React.DragEvent) => {
    if (!canDragXY) return;
    
    const dragData: DraggedIcon = {
      icon: 'ti ti-chart-scatter',
      field: `${activeXField}___${activeYField}`,
      type: 'xy',
      title: `XY: ${formatFieldName(activeXField)} vs ${formatFieldName(activeYField)}`
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
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
      }
    } catch (error) {
      console.error('Error procesando drop:', error);
    }
  };

  // Determinar qué mostrar
  const showIndividualChart = selectedField && !xyChartActive;
  const showXYChart = xyChartActive && activeXField && activeYField;

  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-col col-span-1">
      {/* Parte Superior: Configuración XY Simplificada */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">
          Gráfico XY
        </h3>

        {/* Espacios de arrastre para ejes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Eje X */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center min-h-[60px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'x')}
            onClick={() => !selectedXField && document.getElementById('x-axis-select')?.focus()}
          >
            {selectedXField ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium text-blue-700">
                  {formatFieldName(selectedXField)}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onXFieldChange?.('');
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <i className="ti ti-axis-x text-gray-400 text-lg mb-1"></i>
                <span className="text-xs text-gray-500">Arrastra campo X aquí</span>
              </>
            )}
          </div>

          {/* Eje Y */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center min-h-[60px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-green-400 hover:bg-green-50"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'y')}
            onClick={() => !selectedYField && document.getElementById('y-axis-select')?.focus()}
          >
            {selectedYField ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium text-green-700">
                  {formatFieldName(selectedYField)}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onYFieldChange?.('');
                  }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <i className="ti ti-axis-y text-gray-400 text-lg mb-1"></i>
                <span className="text-xs text-gray-500">Arrastra campo Y aquí</span>
              </>
            )}
          </div>
        </div>

        {/* Botón Aplicar Gráfico XY */}
        {canApplyXY && (
          <div className="mb-3">
            <button
              onClick={handleApplyXY}
              className="w-full py-2 px-3 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white cursor-pointer shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <i className="ti ti-chart-scatter"></i>
              Ver Gráfico XY
            </button>
          </div>
        )}

        {/* Botón para arrastrar gráfico XY activo */}
        {canDragXY && (
          <div className="mb-3">
            <button
              draggable
              onDragStart={handleXYDragStart}
              className="w-full py-2 px-3 rounded text-sm font-medium bg-green-500 hover:bg-green-600 text-white cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              title="Arrastra al dashboard para añadir este gráfico XY"
            >
              <i className="ti ti-hand-grab"></i>
              Arrastrar Gráfico al Dashboard
            </button>
          </div>
        )}

        {/* Campos disponibles para arrastrar */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Campos Disponibles</h3>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {formFields.map((f) => (
              <div
                key={f}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', f);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onFieldClick(f)}
                className={`px-2 py-1.5 rounded border text-xs transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  selectedField === f
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{formatFieldName(f)}</span>
                  <i className="ti ti-grip-horizontal text-gray-400"></i>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Gráficos Individuales */}
        {selectedField && !xyChartActive && (
          <div className="mt-2">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">Tipos de Gráfico</h3>
            <div className="flex gap-1 flex-wrap">
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
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs border transition-all duration-200 ${
                    icon.disabled 
                      ? 'cursor-not-allowed opacity-30 border-gray-200 bg-gray-100 text-gray-400' 
                      : selectedIcon === icon.name 
                        ? 'border-blue-500 bg-blue-100 text-blue-600 cursor-pointer' 
                        : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-grab active:cursor-grabbing hover:scale-105'
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

        {/* Información de estado */}
        {xyChartActive && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            <div className="flex items-center gap-2">
              <i className="ti ti-check text-green-600"></i>
              <div>
                <strong>Gráfico Activo:</strong> {formatFieldName(activeXField)} vs {formatFieldName(activeYField)}
                <div className="text-green-600 mt-1">
                  Usa el botón verde para arrastrar al dashboard
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista previa del gráfico */}
      <div className="flex-1 border-t pt-2">
        <h3 className="text-sm font-semibold mb-1 text-center text-gray-800">
          {showIndividualChart ? `Gráfico: ${formatFieldName(selectedField)}` : 
           showXYChart ? `Gráfico XY: ${formatFieldName(activeXField)} vs ${formatFieldName(activeYField)}` :
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
          ) : showXYChart ? (
            <div className="w-full h-full">
              <div id="xyChart" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded w-full">
              <div className="text-gray-400 text-xs text-center px-2">
                <i className="ti ti-chart-scatter text-lg mb-1 block"></i>
                {selectedXField || selectedYField 
                  ? 'Arrastra ambos campos para ver el gráfico'
                  : 'Arrastra campos a los ejes X e Y'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}